
var Counter = Backbone.Model.extend({
    defaults : {"value" : 0}
});

var CounterView = Backbone.View.extend({
    render: function () {
        var val = this.model.get("value");
        var btn = '<button class="increment">Increment</button>';
        var btnD = '<button class="decrement">Decrement</button>';
        var btnC = '<button class="clear">Clear</button>';
        this.$el.html('<p>'+val+'</p>' + btn + btnD+ btnC);
    }
});


var counterModel, counterView;
$(document).ready( function () {

 counterModel = new Counter();

 counterView = new CounterView({model : counterModel});
 counterView.render();


 

counterModel.on("change", function () {
    counterView.render();
});

counterView.$el.on("click",".increment", function () {
    var mod = counterView.model;
    var currVal = mod.get("value");
    mod.set("value",currVal+1);
});

counterView.$el.on("click",".decrement", function () {
    var mod = counterView.model;
    var currVal = mod.get("value");
    if(currVal !==0){
    mod.set("value",currVal-1);
    }
});

counterView.$el.on("click",".clear", function () {
    var mod = counterView.model;
    var currVal = mod.get("value");
    mod.set("value",currVal=0)
});

$("#counterdiv").append(counterView.$el);


});
