
var groceryCollectionView;
var groceryCollection;
var view;

$(document).ready( function () {
var Grocery = Backbone.Model.extend({
	defaults : {'id':0,'name':'', 'price' : 0, "quantity" : 0},
		initialize : function () {
			this.fetch();
		},
		nameReplace : function (str) {
			this.set('name', str);
			this.save();
		},
		priceReplace : function (str) {
			this.set('price', str);
			this.save();
		},
		quantityReplace : function (str) {
			this.set('quantity', str);
			this.save();
	}

});



var GroceryView = Backbone.View.extend({
	render: function () {
		var groceryName = this.model.get('name');
		var groceryPrice = this.model.get('price');
		var groceryQuantity = this.model.get('quantity');
		var nameInput = '<input type="text"  class="nameInput" value="' + groceryName + '" />'
		var priceInput = '<input type="text" class= "priceInput" value="' + groceryPrice + '" />'
		var quantityInput= '<input type="text" class="quantityInput"value="' + groceryQuantity + '" />'
		var pbtn= '<button class="setPrice">Set price</button>'
		var qbtnUp = '<button class="quantUp">Increase quantity</button>'
		var qbtnDown = '<button class="quantDown">Decrease quantity</button>'
		this.$el.html('<div>'+ "Item: "+ nameInput+"  "+"Price: $"+ priceInput+ "  "+ pbtn+"  "+"quantity:"+" "+ quantityInput+qbtnUp+qbtnDown)
	},
	initialize: function () {
		this.model.on('change',this.render,this)
	},
	events : {
		'click .quantUp': 'replaceQUp',
		'click .quantDown': 'replaceQDown',
		"keypress input" : "updateOnEnter",
		'click .setPrice' : 'replacePrice'
	},
	replaceQUp : function (){
		var num = this.$el.find('.quantityInput').val();
		var addz =parseInt(num)
		this.model.quantityReplace(addz+1)
	}, 
	replaceQDown : function (){
		var num = this.$el.find('.quantityInput').val();
		this.model.quantityReplace(parseInt(num-1))
	},
	updateOnEnter: function (e){
        if(e.keyCode == 13) {
            this.model.nameReplace(this.$el.find('.nameInput').val());
    	}
    },
    replacePrice: function (){
    	this.model.priceReplace(this.$el.find('.priceInput').val());
    }

})


var GroceryCollection = Backbone.Collection.extend({
	model : Grocery,
	url: '/grocerys',
	initialize: function () {
		this.fetch();
	}
});

var idCount = 0;

var GroceryCollectionView= Backbone.View.extend({
	render : function () {
		var btnModel = '<button class="addmodel">Add another item</button>';
		var div = '<div id="list-list"></div>';
		this.$el.html(div + btnModel);
	},
	initialize : function () {
        this.listenTo(this.collection, 'add', this.addOne);
    },
    events : {
        "click .addmodel" : "addCollection"
    },
    addOne : function (list) {
        view = new GroceryView({model : list});
        view.render();
        this.$("#list-list").append(view.$el);
    },
      addCollection : function () {
        this.collection.create({id : idCount});
        idCount = idCount+1;
    }
})

groceryCollection = new GroceryCollection();

groceryCollectionView= new GroceryCollectionView({collection : groceryCollection})

groceryCollectionView.render();

$('#grocerydiv').append(groceryCollectionView.$el);





})
