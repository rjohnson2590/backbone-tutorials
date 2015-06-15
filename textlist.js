
$(document).ready( function () {

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

var TextCollection = Backbone.Collection.extend({
    model : TextModel
});

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

var textCollection = new TextCollection();

var textCollectionView = new TextCollectionView({ collection : textCollection});

textCollectionView.render();

$("#listdiv").append(textCollectionView.$el);

});
