/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * Login api url handler
 * @connectionErrors - generic db connection errors handler
 * @resetUtils - reset password utility functions for all data manupulation and curd operations
 */
var connectionErrors = require('../../utilities/ConnectionErrors'),
    resetUtils = require('./utils/ResetPasswordUtils');

module.exports = function(app, route, dbConnection){

	/**
	 * test api to check if URL for API's are working
	 */
	app.get('/resetpwd/init', function (req, resp) {
		resp.send('<h1 style="color:green">Node hosted sucessfully</h1><p>you can now jump to API.</p>');
	});

    /**
	 * map temporary password to reset password
	 * @req - request params for api
	 * @resp - response tobe send
	 * @req param {* ||} UserEmail
	 * @req param {* ||} UserName
	 * @req param {*} TempPassword
	 * @req param {*} UserPassword
	 */
	app.post('/resetpwd/auth', function (req, resp) {
        dbConnection.getConnection(function (err, connection) {
			console.log('::::in mysql pool connection::::::');
			if (err) {
				connectionErrors.connectionError(err, connection);
			}			
			var reqData = req.body;
			var resetPassword = new resetUtils.resetTemporaryPassword(dbConnection, reqData, resp, connection);
			resetPassword.execute();
		});
	});

	/**
     * Backup API if API doesn't exist at all
	 * @req - request params for api
	 * @resp - response tobe send
     */
	app.get('/resetpwd/:id', function(req, res) {
		res.send('respond with a home data with id - '+ req.params.id);
	});

	/**
	 * Return middleware.
	 */
    return function(req, res, next) {
        next();
    };
}