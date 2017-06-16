/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * Registration api url handler
 * @connectionErrors - generic db connection errors handler
 * @customErrors - generic custom errors handler
 * @recoveryUtils - recovery utility functions for all data manupulation and curd operations
 */
var connectionErrors = require('../../utilities/ConnectionErrors'),
	customErrors = require('../../utilities/CustomErrors'),
	recoveryUtils = require('./utils/RecoveryUtils');
	
module.exports = function (app, route, dbConnection) {

	/**
	 * test api to check if URL for API's are working
	 */
	app.get('/recovery/init', function (req, resp) {
		resp.send('<h1 style="color:green">Node hosted sucessfully</h1><p>you can now jump to API.</p>')
	});

	/**
	 * Get temporary password onregistered email with provided params
	 * @req - request params for api
	 * @resp - response tobe send
	 * @req param {* ||} UserEmail
	 * @req param {* ||} UserName
	 * @req param {*} DateOfBirth
	 */
	app.post('/recovery/recoverPassword', function (req, resp) {
		dbConnection.getConnection(function (err, connection) {
			console.log(':::::::in mysql pool connection::::::::');
			if (!err) {
				var reqData = req.body;
				var emailTempPassword = new recoveryUtils.emailTemporaryPassword(dbConnection, reqData, resp, connection);
				emailTempPassword.execute();
			} else {
				//connection released 
				connectionErrors.connectionError(err, connection);
			}
		});
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
	app.post('/recovery/resetPassword', function (req, resp) {
        dbConnection.getConnection(function (err, connection) {
			console.log('::::in mysql pool connection::::::');
			if (err) {
				connectionErrors.connectionError(err, connection);
			}			
			var reqData = req.body;
			var resetPassword = new recoveryUtils.resetTemporaryPassword(dbConnection, reqData, resp, connection);
			resetPassword.execute();
		});
	});


    /**
     * Send message
	 * @req - request params for api
	 * @resp - response tobe send
     */
	app.get('/recovery/sendSMS', function (req, resp) {
		console.log(':::::::Sending message:::::::')
		var SMS = new recoveryUtils.messageTemporaryPassword(resp);
		SMS.execute();
	});


    /**
     * Backup API if API doesn't exist at all
	 * @req - request params for api
	 * @resp - response tobe send
     */
	app.get('/recovery/:id', function (req, res) {
		res.send('respond with a home data with id - ' + req.params.id);
	});

	/**
	 * Return middleware.
	 */
	return function (req, res, next) {
		next();
	};
}
