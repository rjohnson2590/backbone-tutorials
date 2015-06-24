
var sudokuNums='158.2..6.2...8..9..3..7.8.2.6.74......4.6.7......19.5.4.9.3..2..2..5...8.7..9.413'
var nums = sudokuNums.split('')
var arr1= nums.slice(0,8)
var arr2= nums.slice(9,17)
var arr3= nums.slice(18,26)
var arr4= nums.slice(19,37)
var arr5= nums.slice(38,46)
var arr6= nums.slice(47,55)
var arr7= nums.slice(56,64)
var arr8= nums.slice(65,73)
var arr9= nums.slice(74,81)
var newNums=[];
var sudokuCollectionView;
var coll; 
var view;
var rend;
var board;
$(document).ready( function () {

var SudokuModel = Backbone.Model.extend({
	    defaults : {"value" : "0", 'cell' : '0'}
	});

   var SudokuView = Backbone.View.extend({
    render: function () {
        var sudokuVal = this.model.get("value");
        this.$el.html(sudokuVal);
    },
    initialize: function () {
        this.on("change", this.render, this);
        // last argument 'this' ensures that render's
        // 'this' means the view, not the model
    }
});


var SudokuCollection = Backbone.Collection.extend({
    model : SudokuModel
});


var SudokuCollectionView = Backbone.View.extend({
	render : function () {
		var btn = '<button id="addbutton"> Press first</button>';
		var btnR='<button id="rendbutton"> Press Second</button>';
		this.$el.html(btn + btnR)    
	},
	betterRender: function () {
		for(var i=0; i<rend.models.length;i++){
			newNums.push(rend.models[i].attributes.value)
		}

		// board = ['+---------+---------+---------+',
		// 	 '| x  x  x | y  x  y | y  x  y |',
		// 	 '  x  y  y | y  x  y | y  x  y |',
		// 	 '| y  x  y | y  x  y | x  y  x |',
		// 	 '+---------+---------+---------+',
		// 	 '| y  x  y | x  x  y | y  y  y |',
		// 	 '  y  y  x | y  x  y | x  y  y |',
		// 	 '| y  y  y | y  x  x | y  x  y |',
		// 	 '+---------+---------+---------+',
		// 	 '| x  y  x | y  x  y | y  x  y |',
		// 	 '  y  x  y | y  x  y | y  y  x |',
		// 	 '| y  x  y | y  x  y | x  x  x |',
		// 	 '+---------+---------+---------+' ]

		// 	for(var j =0; j<board.length; j++){
		// 		for(var h =0; h<board[j].length; h++){
		// 			if(board[j][h]=='x'){
		// 				board[j][h]='k'
		// 			}
		// 		}
		// 		console.log(board)
		// 	}



		var arr1= newNums.slice(0,9).join('&nbsp&nbsp&nbsp&nbsp')
		var arr2= newNums.slice(9,18).join('&nbsp&nbsp&nbsp&nbsp')
		var arr3= newNums.slice(18,27).join('&nbsp&nbsp&nbsp&nbsp')
		var line1=['+---------+---------+---------+']
		var arr4= newNums.slice(27,36).join('&nbsp&nbsp&nbsp&nbsp')
		var arr5= newNums.slice(36,45).join('&nbsp&nbsp&nbsp&nbsp')
		var arr6= newNums.slice(45,54).join('&nbsp&nbsp&nbsp&nbsp')
		var line2= ['+---------+---------+---------+']
		var arr7= newNums.slice(54,63).join('&nbsp&nbsp&nbsp&nbsp')
		var arr8= newNums.slice(63,72).join('&nbsp&nbsp&nbsp&nbsp')
		var arr9= newNums.slice(72,81).join('&nbsp&nbsp&nbsp&nbsp')
		var line3= ['+---------+---------+---------+']
		var forGrid= [arr1,arr2,arr3,line1,arr4,arr5,arr6,line2,arr7,arr8,arr9,line3]
		for(k=0;k<12;k++){
			var good= parseInt(k)
			$("#listdiv").append(forGrid[k]+'<br/>')
		}
	},
	initialize : function () {
        this.listenTo(this.collection, 'add', this.addCell);
    },
	    events : {
        "click #addbutton" : "addModel",
        "click #rendbutton" : "betterRender"
    },
	addModel : function () {
	for (var i = 0; i<nums.length;i++){
		this.collection.add([{value:nums[i]}]);
		// coll.add([{value:nums[i]}])
		}
		for (var j =0; j<nums.length;j++){ 
			// $("#listdiv").append(this.collection.models[j].attributes.value)
		}
			rend=this.collection
			return rend
        // collection adds a model, fires add event, then listener calls this.addView(model)
	// addCell : function (newModel) {
	// 	view = new SudokuView({model: newModel})
	// 	for(var i=0; i<nums.length; i++){
 //            newModel.set([{value:nums[i]}])
 //            this.$("#listdiv").append();

        }
        	
		

})

 coll = new SudokuCollection()

// for (var i = 0; i<nums.length;i++){
// 	coll.add([{value:nums[i]}])
// }



sudokuCollectionView = new SudokuCollectionView({ collection : coll});

// for (var i =0; i<nums.length;i++){ 
// 	$("#listdiv").append(coll.models[i].attributes.value)
// }

sudokuCollectionView.render();

$("#listdiv").append(sudokuCollectionView.$el);


// var TextCollectionView = Backbone.View.extend({


    
// });

// var board = ['+---------+---------+---------+',
// 			 '| x  x  x | y  x  y | y  x  y |',
// 			 '  x  y  y | y  x  y | y  x  y |',
// 			 '| y  x  y | y  x  y | x  y  x |',
// 			 '+---------+---------+---------+',
// 			 '| y  x  y | x  x  y | y  y  y |',
// 			 '  y  y  x | y  x  y | x  y  y |',
// 			 '| y  y  y | y  x  x | y  x  y |',
// 			 '+---------+---------+---------+',
// 			 '| x  y  x | y  x  y | y  x  y |',
// 			 '  y  x  y | y  x  y | y  y  x |',
// 			 '| y  x  y | y  x  y | x  x  x |',
// 			 '+---------+---------+---------+' ]





});
