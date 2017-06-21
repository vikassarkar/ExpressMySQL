
/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * Main js file to handle aplication routing and errors 
 * @express - node module used for providing api interface b/w DB and UI
 * @router - express router to route in folders
 * @path - to provide absolute path
 * @logger - log all details
 * @cookieParser - parse cookie/headers
 * @bodyParser - parse request and response for express api
 * @_ - lodash used for utilities function
 * @dbConnection - connection for MYSQL DB
 * @envConfig - envirnoment required and configured variables
 * @app - basic express object to handle all urls
 */
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
	 * use Logger to log all details
	 */
	app.use(logger('dev'));

	/**
	 * use body parser to parse request and response for express api
	 */
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: false
	}));	

	/**
	 * cookie paeser to parse all header cookies
	 */
	app.use(cookieParser());
	
	/**
	 * Define dynamic routes to have septare controllers for seprate module
	 */
	var routes = require('./configs/ApiRouteConfig');
	_.each(routes, function(controller, route) {
		app.use(route, controller(app, route, dbConnection));
	});

	/**
	 * catch 404 and forward to error handler
	 */
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	/**
     * development envirnoment error handler
	 * will print stacktrace
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
	 * production envirnoment error handler
	 * no stacktraces leaked to user
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

	/**
	 * return basic express object to handle all urls
	 */
	return app;
};