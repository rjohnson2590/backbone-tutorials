
$(document).ready( function () {

var Counter = Backbone.Model.extend({
    defaults : {"value" : 0}
});

var CounterView = Backbone.View.extend({
    render: function () {
        var val = this.model.get("value");
        var btn = '<button>Increment</button>';
        this.$el.html('<p>'+val+'</p>' + btn);
    }
});

var counterModel = new Counter();

var counterView = new CounterView({model : counterModel});
counterView.render();

counterModel.on("change", function () {
    counterView.render();
});

counterView.$el.on("button click", function () {
    var mod = counterView.model;
    var currVal = mod.get("value");
    mod.set("value",currVal+1);
});

$("#counterdiv").append(counterView.$el);

});
