/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * @connectionErrors - to handle DB connection error
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
	 * @req param {* ||} UserEmail: provided usremail
	 * @req param {* ||} UserName: provided username
	 * @req param {*} UserPassword: provided password
	 */
	app.post('/login/auth', function (req, resp) {
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
	 * Return middleware.
	 */
    return function(req, res, next) {
        next();
    };
}