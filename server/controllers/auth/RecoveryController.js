'use strict';

var connectionErrors = require('../../utilities/ConnectionErrors'),
	customErrors = require('../../utilities/CustomErrors'),
    recoveryUtils = require('./utils/RecoveryUtils'),
    async = require('async');

// create reusable transporter object using the default SMTP transport


// setup email data with unicode symbols


module.exports = function(app, route, dbConnection){

	/**
	 * test api to check if URL for API's are working
	 */
	app.get('/recovery/init', function (req, resp) {
		resp.send('<h1 style="color:green">Node hosted sucessfully</h1><p>you can now jump to API.</p>')
	});

	/**
	 * @UserEmail
	 * @UserName
	 * @DateOfBirth
	 */
	app.post('/recovery/recoverPassword', function(req, resp) {
		dbConnection.getConnection(function (err, connection) {
			console.log('::::::::::::::::::in mysql pool connection::::::::::::::::::');
			if (!err) {
				var reqData = req.body;
				 dbConnection.query('SELECT * from auth WHERE UserEmail=? or UserName=?',
					[reqData.UserEmail, reqData.UserName], 
					function(err, authDetails, fields){                        
						if (!err) {
							if(authDetails.length > 0){						
								console.log(':::::::::::::Got recovery user:::::::::::::');
								connection.release();	
								// send mail with defined transport object
								recoveryUtils.sendTemporaryPasswordEmail(authDetails[0].UserEmail, resp, connection);							
							}else{
								customErrors.noDataFound(resp, connection)
							}                    
						}else{
							//connection released                
							connectionErrors.queryError(err, connection);
						}
					}
				);
				
			}else{		
				connectionErrors.connectionError(err, connection);
			}
		});
	});

    /**
     * Backup API if API doesn't exist at all
     */
	app.get('/recovery/:id', function(req, res) {
		res.send('respond with a home data with id - '+ req.params.id);
	});    
    
	/*
     **Return middleware.
     */
    return function(req, res, next) {
        next();
    };
}
