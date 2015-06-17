# Introduction to This Tutorial

In these notes we&rsquo;ll be covering several major topics: 

-   Organizing client-side code using Backbone
-   Communicating with a simple Node/Express server using Backbone

For the first part, we&rsquo;re only presuming a small amount of base jQuery knowledge. In our second part, we&rsquo;ll be assuming very mild familiarity with Node and Express, but we&rsquo;ll be at least be explaining all the functionality from Express that we need for the small servers that we&rsquo;re writing. The exercises in this tutorial will mostly consist of asking the user to extend the functionality of the applications we&rsquo;re developing, but there are a few that will involve starting from scratch based off of the examples already seen. As this tutorial is written using [org-mode](http://orgmode.org/)&rsquo;s Babel functionality, all the source code of the applications in this tutorial is included in the text and can be extracted from the org-mode file using the Emacs command `C-c C-v C-t`. A Markdown copy of this tutorial will also be included in the repository. 

# The Overall Point of Backbone

If you&rsquo;re reading this, then it&rsquo;s likely that your ultimate goal is to understand how to make interactive web sites. One of the difficulties in writing larger and more complex sites is keeping all the code principled and well-organized. For example, consider the way that in templates you can have something like

    body
      if someVariable
        p (HTML to render if the variable was true)
      else
        p (HTML to render if the variable wasn't true')

or you could have, at the javascript level, an if-statement like

    if (someVariable){
        response.render('one-thing');
    }
    else {
        response.render('another-thing');
    }

There are two different places where we could make the decision on what HTML to render by examining the same variable&rsquo;s value. Is one better than the other? That&rsquo;s a matter of opinion. What&rsquo;s less controversial is that you **don&rsquo;t** want to have a mix of logic in different places. If your project is putting lots of logic in the templates, you don&rsquo;t want to add a new page and have its display logic in the route handler or visa versa because your teammates (or yourself in a week&rsquo;s time) won&rsquo;t know where to look. 

This problem becomes much more pronounced when we consider that sites these days deal with many different kinds of *data*. If we&rsquo;re Twitter, there&rsquo;s users, tweets, followers, lists etc. If we&rsquo;re a photosharing site such as Flickr or Instagram then there&rsquo;s going to be users and images as some of the most important data stored, and there&rsquo;s tags on the images that can be used to search. Essentially any website you&rsquo;ll be using has some kind of data that needs to be recorded in a database, loaded from the server to the client, displayed by rendering HTML, and then modified using the UI of the site, which we can look at as a reversal of the same path back from the DOM down to the server.

For each kind of data, tweets, users, images, etc. that entire pipeline of

    server <===> client code <===> DOM

needs to be handled. There&rsquo;s many possibilities for **how** you organize the code that creates this pipeline, though, and potentially a lot of duplicated code when trying to create a framework that works for all the kinds of data in your application. This is where the concept of *separation of concerns* comes in. We&rsquo;re going to further divide the central &ldquo;client code&rdquo; part of our diagram into two components: the *model* and the *view*, which means our diagram is going to instead look like

    server <===> model <===> view <===> DOM

where the *model* is the part that contains **a particular piece of data** on the client side (a tweet, an image, a user profile) and controls syncing the client and server data together, and the *view* is the part that creates the HTML for display the data **and** handles UI actions that will modify the data in the model. 

If we divide things this way, the job of knowing how to write our code gets a bit simpler. If we&rsquo;re writing code that&rsquo;s syncing data with the server, that needs to go into our &ldquo;model&rdquo; code for that type of data. If we&rsquo;re writing code that&rsquo;s building the user interface dynamically from data, such as a list of tweets, then that needs to go in our &ldquo;view&rdquo; code. 

Of course, there&rsquo;s going to be a lot of replication if we perform this model/view division for all the data in our web app and we **certainly** don&rsquo;t want to write a new framework for each application we work on. We also need to write the glue code that allows the server to communicate with the models, the models communicate with the views, and the views communicate with the DOM. This is where Backbone comes in. 

Backbone is a library that comes with pre-defined model and view classes that you can easily customize for your particular application, with built in code and techniques to keep the models and views in sync with each other. As such, Backbone actually has a lot of the tedious code to setup this model/view dichotomy written once and for all, leaving you to worry about the specifics of your application and not the general problem of separating concerns. B

In this tutorial, we&rsquo;ll be covering how to use Backbone for applications. We&rsquo;ll be covering how to 

-   extend Backbone models
-   extend Backbone views
-   connect views to models
-   use events to synchronize models and views
-   use models to communicate with the server
-   render views and insert them into the DOM

The structure of this tutorial is that we&rsquo;ll start first by leaving off the server, so instead we&rsquo;ll be examining just this picture

    model <===> view <===> DOM

and then after getting more comfortable with that picture, we&rsquo;ll add in a server and a database. 

# Installation

In order to get started, you need to download the following files and place them in the `../js` directory of this repository

-   [Backbone](http://backbonejs.org/backbone.js)
-   [Underscore](http://underscorejs.org/underscore.js)
-   [jQuery](http://code.jquery.com/jquery-2.1.4.js)

or, at least on Linux but possibly OS X if you have &ldquo;wget&rdquo; installed, you should be able to run the following shell command to install all of this software locally

    mkdir js &&
    cd js && 
    wget http://backbonejs.org/backbone.js && 
    wget http://underscorejs.org/underscore.js && 
    wget http://code.jquery.com/jquery-2.1.4.js

# Your First Backbone Project: A Simple Counter

## Outline

In this brief project, we&rsquo;re going to create a client side application that will

-   display a number
-   provide a button that allows you to *increase* the number in the counter

What we&rsquo;re going to cover in this section is: 

-   How to create Backbone models and views
    -   Learn about the specific `get` and `set` methods for Backbone models
-   How to render HTML using a view
-   How to connect a model to a view
-   How to use events to ensure that the **view** updates when the **model** changes and the **model** changes when inputs in the **view** are used

The basic outline is that we&rsquo;ll

1.  create a model
2.  create a view connected to this model
3.  install our event handlers

## Lesson and Example Code

First things first, we need to have our base HTML for the application. In this case, we&rsquo;re going to have a rather simple HTML page that initially contains a `<div>` where we&rsquo;re going to place our counter and a button that we&rsquo;ll use to increment the counter.

file: counter.html

    <!doctype html>
    <html>
      <head>
        <title>A Counter Example</title>
        <script type="text/javascript" src="js/jquery-2.1.4.js"></script>
        <script type="text/javascript" src="js/underscore.js"></script>
        <script type="text/javascript" src="js/backbone.js"></script>
        <script type="text/javascript" src="counter.js"></script>
      </head>
      <body>
        <div id="counterdiv"></div>
      </body>
    </html>

As for our javascript file `counter.js`, don&rsquo;t forget to wrap up all our code in a `$(document).ready(function () {})`.

Now, the first thing we&rsquo;re going to do is build our *model*. As discussed in our introduction, a model is the thing that **contains** data in our application. All models are built by calling `Backbone.Model.extend(some-object-with-built-in-data)`. We&rsquo;ll talk about the kinds of things we put in `Backbone.Model.extend` as we need them, but to begin with we&rsquo;re going to have a very **simple** model: our goal is to have a single special property called &ldquo;value&rdquo; that will contain the value of the counter and is going to be modified by our button. To that end, we are going to include the single property `defaults`, which is a list of default values for the special data of our application. 

file: counter.js

    var Counter = Backbone.Model.extend({
        defaults : {"value" : 0}
    });

You might wonder why we&rsquo;re using `defaults` and not just, say, creating a property of Counter called `value` like in the following code

    var Counter = Backbone.Model.extend();
    Counter.prototype.value = 0;

thus causing any instance of `Counter` to have a property `value` which defaults to 0. The basic reason is that we want to use Backbone&rsquo;s *events* to synchronize the model and the view together. In order to use Backbone events, we don&rsquo;t want to use the built in syntax for object properties but rather the `.get()` and `.set()` methods instead.

The next thing we do in our code is make a *view*, which is going to be similar to be very similar to a model with the exception that we need to define its `render` function, which actually generates HTML from the data in the associated model. We&rsquo;ve already decided, using our `defaults` property when creating the `Counter` class, that all counters are going to have a property called `value` which holds the value of the counter. 

    var CounterView = Backbone.View.extend({
        render: function () {
            var val = this.model.get("value");
            var btn = '<button>Increment</button>';
            this.$el.html('<p>'+val+'</p>' + btn);
        }
    });

The next thing we need to do is actually create instances of both our model and a view attached to said model:

    var counterModel = new Counter();
    
    var counterView = new CounterView({model : counterModel});
    counterView.render();

We&rsquo;re almost done, but we still need to set our event handlers. The first one that we&rsquo;re going to do is the `model` event &ldquo;change&rdquo;, which will fire whenever an attribute of the model changes:

    counterModel.on("change", function () {
        counterView.render();
    });

Specifically, we&rsquo;re saying that whenever the model changes the only thing we need to do is re-render the associated view. This takes care of the direction of 

    model ===> view ===> DOM

but what about the reverse direction?
To do that, we&rsquo;re going to install an event handler on the button so that whenever it is clicked, the counter will increment

    counterView.$el.on("button click", function () {
        var mod = counterView.model;
        var currVal = mod.get("value");
        mod.set("value",currVal+1);
    });

Finally, we run the code that inserts the `$el` element of the view into the DOM

    $("#counterdiv").append(counterView.$el);

Now, all that&rsquo;s left is to load our page and take a look!

## Exercises

### Subtraction Button

For this exercise, take the counter example we walked through above and add another button that will *decrement* the counter instead. You&rsquo;ll need to 

1.  modify the render function
2.  modify the existing event handler for the increment function to be more specific
3.  make a new decrement button event handler

1.  Bonus Challenge

    Ensure that the counter **is not changed** if its value is equal to zero. In other words, not only should the counter&rsquo;s value not dip below 0 but the `change` event in the model shouldn&rsquo;t be triggered if the value is 0. Test and ensure it&rsquo;s not firing by placing a `console.log` statement in the `change` event handler

### Clear Button

In addition to or perhaps in lieu of the previous exercise, add a button that resets the counter back to 0. Like the previous exercise, you&rsquo;ll need to

1.  modify the render function
2.  modify the existing event handler for the increment button
3.  make a new button to reset the counter

### Concatenating Text Field

In this exercise, you should start **from scratch** and write a new application that will have

-   an input text field
-   a button labled concatenate
-   a place for the entered text to be displayed

## Cleaning Up Our Code

There&rsquo;s a little bit of ugliness in our code that was there for the sake of pedagogical order: we&rsquo;re **manually** connecting the event handler for the model back to the view and we&rsquo;re also including too much logic of the **model** in the **view** event handlers. This wasn&rsquo;t so bad for our tiny example, but what if we want to have more than one instance of the model? It&rsquo;s going to be annoying to connect everything together correctly and rewrite the model handling code in each view. We&rsquo;re going to present a bit of a cleaned up version of the code that will be better refactored and show that it&rsquo;s easier to insert multiple model/view pairs into the application. We&rsquo;re going to go a little bit faster than the previous time.

in our file counterClean.js

    var Counter = Backbone.Model.extend({
        defaults : {"value" : 0}
    });
    
    Counter.prototype.inc = function () {
        var val = this.get("value");
        this.set("value", val+1);
    }

The first thing we&rsquo;re doing is including a method in the `Counter` class for handling the incrementin. The next thing we&rsquo;re going to do is give the `CounterView` class an initialize method that will install the right event handler on the model that will cause the view to be updated whenever the model changes. For convenience, we&rsquo;re also going to use the &ldquo;events&rdquo; property of the view to make sure that we install the right event handler for the view upon its creation. 

    var CounterView = Backbone.View.extend({
        render: function () {
            var val = this.model.get("value");
            var btn = '<button>Increment</button>';
            this.$el.html('<p>'+val+'</p>' + btn);
        },
        initialize: function () {
            this.model.on("change", this.render, this);
        },
        events : {
            'click button' : 'increment'
        },
        increment : function () {
            this.model.inc();
        }
    });

Now! We can go ahead and make our models and views and insert them into the DOM.

    var counterModel1 = new Counter();
    var counterModel2 = new Counter();
    
    var counterView1 = new CounterView({model : counterModel1});
    var counterView2 = new CounterView({model : counterModel2});
    
    counterView1.render();
    counterView2.render();
    
    $("#counterdiv").append(counterView1.$el);
    $("#counterdiv").append(counterView2.$el);

## Questions To Think About

1.  Why do we include the increment button in the view and not the base HTML?
2.  Think about sites you use frequently and sketch out how they might be divided into
    -   models
    -   views
    -   events

# Collections Project: Text Lists

## Outline

In this project, we&rsquo;re going to again create a *client side only* application that

-   displays a list of items
-   contains a text field and a submit button that will add the entered text to the list

What we&rsquo;re going to cover in this section is:

-   How to create a Backbone *collection* of models
-   How to create view for a collection
-   How to make the collection&rsquo;s view delegate to individual views
-   How to use the collection specific events to keep the view in-sync

## Lesson and Code

When you&rsquo;re dealing with sites like twitter, or instagram, or anythig of that ilk there tend to be **collections** of things. You&rsquo;re reading a *list* of tweets, looking at a *list* of search results, examining a *list* of photos that match a tag, checking a *list* of followers etc. 

In other words, there&rsquo;s a lot of &ldquo;list-like&rdquo; things in the data that we&rsquo;re seeing constantly online. This is such a common pattern that Backbone has, built-in, a *Collection* class that allows you to have &ldquo;lists&rdquo; of models that can listen for special list-specific events such as adding or removing from the list. 

The basic way that Backbone *collections* work is that you associate to each collection the kind of **model** that it&rsquo;s a list of. You still have individual views for each model, though, and we leave the bulk of the work for handling the display and manipulation of data to the **individual** model/view pairs. We&rsquo;ll also have a view for the **collection**, that will handle how the list is displayed. To this end, we&rsquo;re going to proceed by

1.  writing our base html
2.  defining the model and view for our text data
3.  define the collection for the text data model
    -   this part will be rather simple and bare bones in comparison to the view
4.  define the *view* for our collection
    -   the view will include the framework for displaying the list
    -   the view will also include the button that adds a new element to the collection
        -   this will trigger the `add` event for the collection

We&rsquo;re going to start our application very similar to how our previous project started: with some very simple HTML. <sup><a id="fnr.1" name="fnr.1" class="footref" href="#fn.1">1</a></sup>

    <!doctype html>
    <html>
      <head>
        <title>Text in Lists</title>
        <script type="text/javascript" src="js/jquery-2.1.4.js"></script>
        <script type="text/javascript" src="js/underscore.js"></script>
        <script type="text/javascript" src="js/backbone.js"></script>
        <script type="text/javascript" src="textlist.js"></script>
      </head>
      <body>
        <div id="listdiv"></div>
      </body>
    </html>

Next, we&rsquo;ll start with our basic model of a piece of text. It&rsquo;ll have a &ldquo;replace&rdquo; method that will replace the text inside it. It&rsquo;s individual view is going to be an input with the default text of the input set to the value of the model and a &ldquo;clear&rdquo; button that will set the text of the model to the empty string ~&rdquo; &ldquo;~ . This part is basically the same as our previous project, except that we&rsquo;re going to use a different **kind** of event, `keypress`, for setting the value of the text of the model. In particular, if the key pressed in the input field is the &ldquo;enter&rdquo; key, then we call the `replace` operator of the view, which will in turn call the `replace` method of the model.

    var TextModel = Backbone.Model.extend({
        defaults : {"value" : ""}
    });
    
    TextModel.prototype.replace = function (str) {
        this.set("value", str);
    };
    
    var TextView = Backbone.View.extend({
        render: function () {
            var textVal = this.model.get("value");
            var btn = '<button>Clear</button>';
            var input = '<input type="text" value="' + textVal + '" />';
            this.$el.html("<div>" + input + btn + "</div>");
        },
        initialize: function () {
            this.model.on("change", this.render, this);
        },
        events : {
            "click button" : "clear",
            "keypress input" : "updateOnEnter"
        },
        replace : function () {
            var str = this.$el.find("input").val();
            this.model.replace(str);
        },
        clear: function () {
            this.model.replace("");
        },
        updateOnEnter: function (e){
            if(e.keyCode == 13) {
                this.replace();
            }
        }
    });

Next, we actually define the collection. This is pretty similar to all the other Backbone classes that we extend, just with the special attribute `model` that we need to match up to the kind of model we want to store in this collection.

    var TextCollection = Backbone.Collection.extend({
        model : TextModel
    });

After this, we need to make our view for the **collection** and write our event handlers for the collection. This is going to be the bulk of our moving parts for this program. The view for the collection will display all of our individual views as well have a button that will add a new &ldquo;blank&rdquo; text field into our page (with the default text &ldquo;Enter something here&rdquo;). 

    var TextCollectionView = Backbone.View.extend({
        render : function () {
            var btn = '<button id="addbutton">Add Text</button>';
            var div = '<div id="text-list"></div>';
            this.$el.html(div + btn);
        },
        initialize : function () {
            this.listenTo(this.collection, 'add', this.addOne);
        },
        events : {
            "click #addbutton" : "addCollection"
        },
        addOne : function (txt) {
            txt.set("value","Enter something here...");
            var view = new TextView({model : txt});
            view.render();
            this.$("#text-list").append(view.$el);
        },
        addCollection : function () {
            this.collection.create();
        }
    });

There&rsquo;s a few pieces here that we should explain in a bit more detail. First, we&rsquo;re using the more convenient function `listenTo` this time, which in this case means that `this.collection` is now listening on the `add` event and, when it fires, will run `this.addOne` **in the context of the view, not the collection**. Basically, this just lets us avoid including the extra `this` parameter like in our individual model. Calling `addOne` takes the newly added model, creates a view for it, renders it, then adds it to the list of views. We use `events` to listen for when the button is clicked and then we run `addCollection`. In turn, `addCollection` will call the `create` method of the collection. The importance of `create` is that it will simultaneously make a new model and add it to the collection, triggering the `add` event that we&rsquo;re already listening for. 

Note that we don&rsquo;t have to say **anything** in the view for the collection about how the view of the individual model works. We just call that individual view&rsquo;s render function and allow it to take care of everything. 

Finally, we go ahead and run the code we need to initialize the whole application:

    var textCollection = new TextCollection();
    
    var textCollectionView = new TextCollectionView({ collection : textCollection});
    
    textCollectionView.render();
    
    $("#listdiv").append(textCollectionView.$el);

## Exercises

### Delete Button

In this exercise, we&rsquo;re going to add a &ldquo;delete&rdquo; button that will erase the bottom element of the list of elements. To do that, you&rsquo;re going to need to 

-   add a delete button to the view of the **collection**
-   add a event handler that listens for the &ldquo;remove&rdquo; event for the collection and refreshes the list, removing the corresponding view from the DOM.
    -   there&rsquo;s more than one way you could do this, but a simple way might be to use CSS psuedo-selectors to select only the last div in the collection

### Edited Count

In this exercise, you&rsquo;re going to add a new piece of data to the **base** model: the number of times that it&rsquo;s been edited. Every time the field is edited, it should increment this number. In this case, &ldquo;edited&rdquo; means **either** cleared or you&rsquo;ve pressed enter while in the input field. You&rsquo;ll need to also modify the view for the base model. 
Question: will you need to modify the view for the collection?

1.  Extra Credit

    To be a little more challenging, make sure that the number-of-times-incremented only increases if the text has actually changed.

# Server Side Project: Counter With Server

## Outline

In this section, we&rsquo;re going to show how to connect our first counter example with a simple Node server. By the end of this section we&rsquo;ll have shown

-   how to use Backbone to save models to a server
    -   how to set the url route **used** by Backbone to communicate with the server
    -   how to use synchronization methods for models such as `save` and `destroy`

## Lesson and Code

   First, let&rsquo;s put together our client side application and then go ahead and show how to write a simple server to go along with it. Our HTML isn&rsquo;t going to change, other than linking to a different file:
file: counterServe.html

    <!doctype html>
    <html>
      <head>
        <title>A Counter Example</title>
        <script type="text/javascript" src="js/jquery-2.1.4.js"></script>
        <script type="text/javascript" src="js/underscore.js"></script>
        <script type="text/javascript" src="js/backbone.js"></script>
        <script type="text/javascript" src="counterServe.js"></script>
      </head>
      <body>
        <div id="counterdiv"></div>
      </body>
    </html>

and we&rsquo;re going to **mostly** use the same Backbone code as our cleaned-up counter example.
file: counterServe.js

    $(document).ready( function () {
    
        var Counter = Backbone.Model.extend({
            defaults : {"value" : 0},
            urlRoot : "/counter"
        });
    
        var counterModel1 = new Counter({id : 1});
    
        Counter.prototype.inc = function () {
            var val = this.get("value");
            this.set("value", val+1);
            this.save();
        }      
    
        counterModel1.fetch();

the first real change is that we need to set the URL structure that&rsquo;s we&rsquo;re going to use for communicating with the server. In this case, we&rsquo;re going to use `/counter` as the basic route, so we set `urlRoot` to be `/counter`. When Backbone communicates with the server, it will send a message to `route/to/server/counter/id` where `id` is the value of the id of the counter. You might note that we hadn&rsquo;t **used** an ID before now, but by default Backbone needs an `id` to communicate with the server so we include it as a parameter when we create our model.

The view is entirely unchanged from our previous code, since we&rsquo;ve localized all the interaction with the server into the model.

        var CounterView = Backbone.View.extend({
            render: function () {
                var val = this.model.get("value");
                var btn = '<button>Increment</button>';
                this.$el.html('<p>'+val+'</p>' + btn);
            },
            initialize: function () {
                this.model.on("change", this.render, this);
            },
            events : {
                'click button' : 'increment'
            },
            increment : function () {
                this.model.inc();
            }
        });
    
        var counterView1 = new CounterView({model : counterModel1});
    
        counterView1.render();
    
        $("#counterdiv").append(counterView1.$el);
    
    });

and we&rsquo;ll also set up a simple Express server to serve up the the HTML statically and then have a couple of simple routes for handling the get and put from the client side. We&rsquo;ve already decided what routes we should be listening on: `/counter/1` is going to be the URL uses to talk to the server. 

This server is fairly simple. We 

-   set up the server application by calling `express()`
-   initialize a variable that will store the counter, setting it to 0
-   set up the needed middleware for
    -   automatically parsing the request into JSON
    -   serving up the local directory statically
-   set up the routes for Backbone&rsquo;s use
    -   a **get** request to `/counter/1` will send back an object that has the value of the counter
    -   a **put** request to `/counter/1` will extract the value of the counter from the request and store it in the local variable

    var express = require('express');
    var bodyParser = require('body-parser');
    
    var app = express();
    
    var counter1 = 0;
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static(__dirname));
    
    app.get('/counter/1', function (req, res) {
        console.log("counter has been requested");
        res.send(JSON.stringify({value : counter1}));
    });
    
    app.put('/counter/1', function (req, res) {
        console.log(req.body);
        counter1 = req.body.value;
        res.end();
    });
    
    app.listen(3000, function () {
        console.log("server started");
    });

In order to actually run this code, we need to make sure that the appropriate libraries are installed, so run the following shell commands to get your local directory set up with the Node libraries needed. 

    npm install express &&
    npm install body-parser

Then, go ahead and start the server with 

    node counterServer.js

and navigate your browser to `localhost:3000/counterServe.html` see the application. To test and make sure the synchronization with the server is working, try refreshing the page. You should see the value of the counter be restored to what it had been before the refresh. 

## Exercises

### Sync Events

Every time `save` or `fetch` is called, a `sync` event is triggered for the model. Given this fact, go ahead and test this event out by adding 

-   a new `<p>` element to the view
-   an event handler to the view that will update the text of this element every time a sync event is called

1.  Extra Credit

    You&rsquo;ll note that as described, this field doesn&rsquo;t actually **persist** across refreshes of the page. In order to make it actually persist for the life of the server, we&rsquo;ll need to add a **new** view and model. The basic procedure is:
    
    -   define a new model for the refresh data
        -   define the URL root for the refresh model
    -   define a view for the refresh data
    -   have the refresh-model listen for the `sync` event on the counter model and update itself
    
    As with the other exercises in this section, test things out by refreshing the page and making sure that the data doesn&rsquo;t change.

### Decrement Button

A simple exercise to try is to add a decrement button to the view and a decrement operation to the model that synchronizes up with the server correctly. Test your code by refreshing the page.

### Concatenating Text Fields

This exercise is a repeat of the Concatenating Text Fields of the first section, but this time you need to 

-   choose a url path for the data
-   add the appropriate `save` and `fetch` calls to the model to synchronize with the server
-   write a small server based on our example that will serve up our page and listen for Backbone&rsquo;s requests

# Server Side Project: Collections

Next, as a short section we&rsquo;ll be covering how to synchronize Backbone collections with the server. To this end, we&rsquo;ll convert the previous text-fields examples to communicate with a small Express server much like we did in the previous section. 

## Exercises

### 

# Project Ideas

In our final section, we&rsquo;ll be covering a few ideas for small, self-contained Backbone projects.

## Grocery List App

A reasonable plan of action is to

-   define a model for a grocery list item. It should include a
    -   name
    -   price
    -   quantity
-   define a view for the grocery-list item model it should, at the minimum, have
    -   buttons to change the quantity
    -   an input field for the name of the item
    -   an input field for the price-per-item
-   define a collection for the grocery list model and a **view** for said collection
    -   the view should include a button that will add a new model to the collection
-   write a simple server that will keep all this data alive across refreshes of the page

### Extra Credit

Include one more piece of data: a budget. You&rsquo;ll need to make another model and view for the budget. In this case, though, you&rsquo;ll actually want the view for the budget to include **another** field that&rsquo;s the amount you have **left** after subtracting all the current groceries.
You can either

-   have the remaining amount field recalculate when you click a button that&rsquo;s also in the budget&rsquo;s view
-   have the remaining amount field recalculate whenever you&rsquo;ve edited the grocery list

## Sudoku Solver

If you&rsquo;ve completed the sudoku solver project from [Portland Code School&rsquo;s](http://portlandcodeschool.github.io/jsi/2015/06/16/sudoku/) Javascript course, then you can absolutely use Backbone to provide a front-end to the sudoku solver.

Since in your previous efforts, a sudoku puzzle was represented as a sequence of numbers it would be rather natural to have a puzzle be represented by a collection of individual models for each square. Of course, that&rsquo;s not the only way we could do things. In terms of **logical** layout, you might want to have *rows* that are collections of squares, and a *puzzle* is a collection of rows. 

The basic outline of what you should do is:

-   define a model and view for an individual cell
-   define models and views for the entire puzzle
    -   with the intermmediate step of defining models and views for rows if that&rsquo;s how you&rsquo;re planning to do it
    -   add a button to the view that calls your solver on the server and then syncs the front end with the server

### Extra Credit

If you want to make your sudoku implementation more thorough, you can make it more interactive in terms of allowing users to create a sudoku puzzle from scratch by editing the fields. In this case, you might want to start with a completely **blank** puzzle and make the individual cells be editable. 

## Anything You Want

Go ahead. You can actually try anything you&rsquo;d like.

<div id="footnotes">
<h2 class="footnotes">Footnotes: </h2>
<div id="text-footnotes">

<div class="footdef"><sup><a id="fn.1" name="fn.1" class="footnum" href="#fnr.1">1</a></sup> This section of the tutorial is partially inspired by the backbone &ldquo;todo list&rdquo; tutorial <http://backbonejs.org/docs/todos.html></div>


</div>
</div>
