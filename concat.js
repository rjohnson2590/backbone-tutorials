
var Concat = Backbone.Model.extend({
    defaults : {"value" : "Hello there "}
});

var ConcatView = Backbone.View.extend({
    render: function () {
        var val = this.model.get("value");
        var btn = '<button class="concat">String together</button>';
        var btnC = '<button class="clear">Clear inputed value</button>';
        var field= '<form><input type="text" class="text"></form>'
        this.$el.html('<p>'+val+'</p>' + field + btn + btnC);
    }
});


var concatModel, concatView;
$(document).ready( function () {

 concatModel = new Concat();

 concatView = new ConcatView({model : concatModel});
 concatView.render();


 concatModel.on("change", function () {
    concatView.render();
});


concatView.$el.on("click",".concat", function () {
    var mod = concatView.model;
    var currVal = mod.get("value");
    mod.set("value",currVal + $(".text").val());
});

concatView.$el.on("click",".clear", function () {
    var mod = concatView.model;
    var currVal = mod.get("value");
    mod.set("value", mod.defaults.value);
});

$("#concatdiv").append(concatView.$el);

 });

