
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var counter1 = 0;
var text1;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get('/counter/1', function (req, res) {
    console.log("counter has been requested");
    res.send(JSON.stringify({value : counter1, text : text1}));
});

app.put('/counter/1', function (req, res) {
    console.log(req.body);
    counter1 = req.body.value;
    text1= req.body.text
    // console.log(text1)
    res.end();
});


app.listen(3000, function () {
    console.log("server started");
});
