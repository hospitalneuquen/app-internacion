var express = require('express'),
    path = require('path'),
    logger = require('morgan');

// Express config
var app = express();
app.use(logger('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Routes
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', function(req, res, next) {
    res.sendFile(path.join(__dirname, '', 'public/app.html'));
});

// Error handlers
// ... 404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// ... development
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// ... production
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
