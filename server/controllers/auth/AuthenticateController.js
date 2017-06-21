/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * Login api url handler
 * @connectionErrors - generic db connection errors handler
 * @authenticateUtils - authentication utility functions for all data manupulation and curd operations
 */
var connectionErrors = require('../../utilities/ConnectionErrors'),
    authenticateUtils = require('./utils/AuthenticateUtils');

module.exports = function(app, route, dbConnection){

	/**
	 * test api to check if URL for API's are working
	 */
	app.get('/login/init', function (req, resp) {
		resp.send('<h1 style="color:green">Node hosted sucessfully</h1><p>you can now jump to API.</p>');
	});

    /**
	 * Logging in with provided params
	 * @req - request params for api
	 * @resp - response tobe send
	 * @req param {* ||} UserEmail: provided String param for usremail
	 * @req param {* ||} UserName: provided String param for username
	 * @req param {*} UserPassword: provided String param for password
	 */
	app.post('/login/auth', function (req, resp) {
		console.log(req.headers)
		console.log("******************************************************")
		console.log("\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/");
		console.log(req.cookies)
        dbConnection.getConnection(function (err, connection) {
			console.log('::::::in mysql pool connection:::::::');
			if (err) {
				connectionErrors.connectionError(err, connection);
			}			
			var reqData = req.body;
			var authenticateUser = new authenticateUtils.authenticateUser(dbConnection, reqData, resp, connection);
			authenticateUser.execute();
		});
	});

	/**
     * Backup API if API doesn't exist at all
	 * @req - request params for api
	 * @resp - response tobe send
     */
	app.get('/login/:id', function(req, res) {
		res.send('respond with a home data with id - '+ req.params.id);
	});

	/**
	 * Trial api for handeling parameterized request
	 * @req - request params for api
	 * @resp - response tobe send
	 */
	app.get('/login/init/:id1/:id2', function (req, resp) {
		resp.send('<h1 style="color:green">Node hosted sucessfully</h1><p>you can now jump to API.</p> ---'+req.params.id1+"---"+req.params.id2);
	});

	/**
	 * Return middleware.
	 */
    return function(req, res, next) {
        next();
    };
}