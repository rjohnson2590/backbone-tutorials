
var view;
var viewArr= [];
var counter=[];
var edited= counter.length
var editCount= [];
var textCollection;
var textCollectionView;
$(document).ready( function () {

var TextModel = Backbone.Model.extend({
    defaults : {"value" : "", 
    "counter":''},
    replace : function (str) {
      this.set("value", str);
    }
});

   var TextView = Backbone.View.extend({
    render: function () {
        var textVal = this.model.get("value");
        var counterVal= this.model.get("counter")
        var btn = '<button class="clear">Clear</button>';
        var input = '<input type="text" value="' + textVal + '" />';
        this.$el.html(textVal+"<br><div>" + input + btn + "</div>"+"Number of times edited: "+counterVal);
    },
    initialize: function () {
        this.model.on("change", this.render, this);
        // last argument 'this' ensures that render's
        // 'this' means the view, not the model
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
        counter.push(1)
        this.model.set('counter', counter.length)
        console.log(counter)
    },
    updateOnEnter: function (e){
        if(e.keyCode == 13) {
            this.replace();
        }
    },
    delete: function(){
        console.log('hif')
        viewArr.pop()

    }
});

var TextCollection = Backbone.Collection.extend({
    model : TextModel
});



var TextCollectionView = Backbone.View.extend({
    render : function () {
        var btn = '<button id="addbutton">Add Text</button>';
        var btnD = '<button id="deletebutton">Delete Text</button>'
        var div = '<div id="text-list"></div>';
        var edited= counter.length
        this.$el.html(div + btn+btnD);
        // for(var i=0; i<viewArr.length; i++){
        //     viewArr[i].render();
        //     this.$("#text-list").append(viewArr[i].$el);
        // }
    },
    initialize : function () {
        this.listenTo(this.collection, 'add', this.addView);
    },
    events : {
        "click #addbutton" : "addModel",
        "click #deletebutton" : "delete"
    },
    addModel : function () {
        this.collection.add({});
        // collection adds a model, fires add event, then listener calls this.addView(model)
    },
    addView : function (newModel) {
        counter.push(1)
        var edited= counter.length
        newModel.set("value","Enter something here...");
        newModel.set('counter', edited)
        view = new TextView({model : newModel});
        viewArr.push(view)
        view.render();
        this.$("#text-list").append(view.$el);
        // for(var i=0; i<viewArr.length; i++){
        //     viewArr[i].render();
        //     this.$("#text-list").append(viewArr[i].$el);
        // }
        // this.render()

        console.log(counter)
        this.addCounter()
    },
     delete: function(){
        // viewArr.pop()
        // this.render()
        var getOuttaHere= viewArr.pop()
        getOuttaHere.remove()    
        

    },
    addCounter: function(){

    }
});

 textCollection = new TextCollection();

 textCollectionView = new TextCollectionView({ collection : textCollection});

textCollectionView.render();

$("#listdiv").append(textCollectionView.$el);

});
