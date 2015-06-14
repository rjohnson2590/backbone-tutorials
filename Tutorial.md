# Introduction to This Tutorial

In these notes we&rsquo;ll be covering several major topics: 

-   Organizing client-side code using Backbone
-   Communicating with a Node server using Backbone
-   Syncing our data to a persistent store, in the form of a MongoDB database

For the first part, we&rsquo;re only presuming a small amount of base jQuery knowledge. In our second part, we&rsquo;ll be assuming some familiarity with Node but will include at least some review of the functions that we&rsquo;re using as we use them. For our final part, we&rsquo;ll be including a modest introduction to the functionality of MongoDB that we require for building our application. The exercises in this tutorial will mostly consist of asking the user to extend the functionality of the applications we&rsquo;re developing. As this tutorial is written using [org-mode](http://orgmode.org/)&rsquo;s Babel functionality, all the source code of the applications in this tutorial is included in the text and can be extracted from the org-mode file using the Emacs command `C-c C-v C-t`. PDF and Markdown copies of this tutorial will also be included in the repository. 

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

Next, we&rsquo;ll start with our basic model of a piece of text. It&rsquo;ll have a &ldquo;replace&rdquo; method that will replace the text inside it, but no others for now. It&rsquo;s individual view is going to be an input with the default text of the input set to the value of the model and a &ldquo;edit&rdquo; button that will set the model to be the current value of the text field. This part is basically the same as our previous project.

    var TextModel = Backbone.Model.extend({
        defaults : {"value" : ""}
    });
    
    TextModel.prototype.replace = function (str) {
        this.set("value", str);
    };
    
    var TextView = Backbone.View.extend({
        render: function () {
            var textVal = this.model.get("value");
            var btn = '<button>Edit</button>';
            var input = '<input type="text" value="' + textVal + '" />';
            this.$el.html("<div>" + input + btn + "</div>");
        },
        initialize: function () {
            this.model.on("change", this.render, this);
        },
        events : {
            "click button" : "replace"
        },
        replace : function () {
            var str = this.$el.find("input").val();
            this.model.replace(str);
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

In this exercise, you&rsquo;re going to add a new piece of data to the **base** model: the number of times that it&rsquo;s been edited. Every time the &ldquo;Edit&rdquo; button is clicked, it should increment this number. You&rsquo;ll need to also modify the view for the base model. 
Question: will you need to modify the view for the collection?

1.  Extra Credit

    To be a little more challenging, make sure that the number-of-times-incremented only increases if the text has actually changed.

# Server Side Project: Counter With Server

In this section, we&rsquo;re going to show how to connect our first counter example with a simple Node server. By the end of this section we&rsquo;ll have shown

-   set the

# Server Side Project: Collections and Databases

In our final section, we&rsquo;ll be covering

-   Backbone&rsquo;s Router class for providing nice URLs on the client side
-   How to use IDs in URLs to index into collections
-   What a full, but small, client-server application looks like in Backbone

## Exercises

### Grocery List App

Our final set of exercises contains just a single task: create a small application from which users can log in, enter a new grocery list, access past grocery lists and sort items in grocery lists by some criterion.

<div id="footnotes">
<h2 class="footnotes">Footnotes: </h2>
<div id="text-footnotes">

<div class="footdef"><sup><a id="fn.1" name="fn.1" class="footnum" href="#fnr.1">1</a></sup> This section of the tutorial is partially inspired by the backbone &ldquo;todo list&rdquo; tutorial <http://backbonejs.org/docs/todos.html></div>


</div>
</div>
