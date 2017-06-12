'use strict';

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
	 * Logging in with provided params
	 * @UserEmail: provided usremail or //not null //from auth
	 * @UserName: provided username and //not null //from auth
	 * @UserPassword: provided password //not null //from auth
	 */
	app.post('/resetpwd/auth', function (req, resp) {
        dbConnection.getConnection(function (err, connection) {
			console.log('::::::::::::::::::in mysql pool connection::::::::::::::::::');
			if (err) {
				connectionErrors.connectionError(err, connection);
			}			
			var reqData = req.body;
			dbConnection.query('SELECT * from auth WHERE UserEmail=? or UserName=?',
			[reqData.UserEmail, reqData.UserName], 
				function(err, authdetails, fields){					
					if (!err) {
						console.log('::::::::::::::::::Got data::::::::::::::::::');
						resetUtils.changePassword(dbConnection, reqData, authdetails, resp, connection);
					}else{                
						connectionErrors.queryError(err, connection);
					}
				}
			);
		});
	});

	/**
     * Backup API if API doesn't exist at all
     */
	app.get('/resetpwd/:id', function(req, res) {
		res.send('respond with a home data with id - '+ req.params.id);
	});

	/*
     **Return middleware.
     */
    return function(req, res, next) {
        next();
    };
}