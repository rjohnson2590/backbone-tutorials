
var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var app = express();
var env = process.env.NODE_ENV || 'development';
var knexConfig = require('./knexfile.js')[env];
var knex = require('knex')(knexConfig);

var name1='';
var price1=0;
var quantity1=0;
var name2=[];
var price2=[];
var quantity2=[];
MongoClient.connect('mongodb://127.0.0.1:27017/shorten', function(err, db) {

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get('/grocerys', function (req,res) {
	console.log('get1')
	var id = req.params.id;
	// res.send(JSON.stringify({name: name1, price: price1, quantity: quantity1}))
});

app.get('/grocerys/:id', function (req,res) {
	console.log('get2')
	var id = req.params.id;
	console.log(id)
	console.log(name2)
	res.send(JSON.stringify({name: name2[id], price: price2[id], quantity: quantity2[id]}))
});

app.post('/grocerys', function (req, res) {
	console.log('gowdy')
	name1= req.body.name;
	price1= req.body.price;
	quantity1= req.body.quantity
	res.end();
})

app.put('/grocerys/:id', function (req, res) {
	console.log("put")
	var id = req.params.id;
	knex('grocery').insert([{id:id,Item:req.body.name,Price:req.body.price,quantity:req.body.quantity }]).then()
	name2.push(req.body.name);
	price2.push(req.body.price);
	quantity2.push(req.body.quantity);
	console.log(req.body)
	res.end();
})

app.listen(3000, function () {
    console.log("server started");
});

});


