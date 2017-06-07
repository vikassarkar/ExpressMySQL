'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    _ = require('lodash'),
    dbConnection = require('./configs/DbConfig').dbConnection,
    envConfig = require('./configs/EnvConfig').envConfig,
    app = express();

module.exports = function() {

	/**
     * set client landing folder
     */
	//app.use(express.static(path.join(__dirname, '../client')));

	/**
	 *use Logger
	 */
	app.use(logger('dev'));

	/**
	 *use body parser
	 */
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: false
	}));	
	
	/**
	 *Define dynamic routes
	 */
	var routes = require('./configs/ApiRouteConfig');
	_.each(routes, function(controller, route) {
		app.use(route, controller(app, route, dbConnection));
	});

	/**
	 *catch 404 and forward to error handler
	 */
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	/**
     *development error handler
	 *will print stacktrace
	 */
	if (envConfig.env === 'development') {		
		app.use(function(err, req, res, next) {
			res.status(err.status || 500);
			res.render('error', {
				message: err.message,
				error: err
			});
		});
	}

	/*
	 *production error handler
	 *no stacktraces leaked to user
	 */
	else if (envConfig.env === 'production') {		
		app.use(function(err, req, res, next) {
			res.status(err.status || 500);
			res.json({
				message: err.message,
				error: err
			});
		});
	}

	return app;
};