
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var name1='';
var price1=0;
var quantity1=0;
var name2='';
var price2=0;
var quantity2=0;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get('/grocerys', function (req,res) {
	var id = req.params.id;
	res.send(JSON.stringify({name: name1, price: price1, quantity: quantity1}))
});

app.get('/grocerys/:id', function (req,res) {
	var id = req.params.id;
	res.send(JSON.stringify({name: name2, price: price2, quantity: quantity2}))
});

app.post('/grocerys', function (req, res) {
	name1= req.body.name;
	price1= req.body.price;
	quantity1= req.body.quantity
	res.end();
})

app.put('/grocerys/:id', function (req, res) {
	name2= req.body.name;
	price2= req.body.price;
	quantity2= req.body.quantity
	console.log(req.body)
	res.end();
})

app.listen(3000, function () {
    console.log("server started");
});
