// server.js

// modules ===================

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// configuration =====================
var db = require('./config/db');

var port = process.env.PORT || 5555;
mongoose.connect(db.url);

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users


//process.on('uncaughtException', function (err) {
//    console.log('Caught exception: ' + err);
//});

// routes ===============
require('./app/routes')(app); // configure the routes

// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);

exports = module.exports = app;