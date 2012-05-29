var express = require('express');
var mason = require('../../index');

var app = express();
var config = {
  'platform.js': 'debug',
  'page.js': 'uglify'
};

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.locals(mason.locals(__dirname, config));

app.use(express['static'](__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index');
});

app.listen(3000);
console.log("Listening on 3000");