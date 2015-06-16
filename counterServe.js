
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
