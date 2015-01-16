var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();

// web app backend
app.use('/admin', favicon(__dirname + '/public/backend/favicon.png'));
app.use('/admin', express.static(__dirname + '/public/backend'));
// web app frontend
app.use(favicon(__dirname + '/public/frontend/favicon.png'));
app.use(express.static(__dirname + '/public/frontend'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api', routes);

// catch 404 and redirect to /
app.use(function(req, res, next) {
  res.redirect('/?path=' + req.path);
});

// error handlers

app.use(function(err, req, res, next) {
  res.status(err.status || 500).end();
});

module.exports = app;
