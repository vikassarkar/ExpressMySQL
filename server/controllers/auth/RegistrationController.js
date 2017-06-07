'use strict';

var connectionErrors = require('../../utilities/ConnectionErrors'),
    customErrors = require('../../utilities/CustomErrors'),
    registrationUtils = require('./utils/RegistrationUtils'),
    async = require('async');

module.exports = function(app, route, dbConnection){

	/**
	 * test api to check if URL for API's are working
	 */
	app.get('/register/init', function (req, resp) {
		resp.send('<h1 style="color:green">Node hosted sucessfully</h1><p>you can now jump to API.</p>');
	});

	/**
	 * get users row based on req query
     * auth table
     * @UserEmail varchar(255) NOT NULL ,
     * @UserName varchar(255) NOT NULL,
     * @UserPassword varchar(255) NOT NULL,
     * 
     * user table
     * @LastName varchar(255) NOT NULL,
     * @FirstName varchar(255),
     * @PhoneNumber varchar(14) NOT NULL,
     * @Adress varchar(255),
     * @City varchar(255) NOT NULL,
     * @PostalCode varchar(50) NOT NULL,
     * @Country varchar(255) NOT NULL,
     * @AlternatePhoneNumber varchar(14),
     * @DateOfBirth date,
     * 
     * @CustomerId int NOT NULL,
     *
     * &PRIMARY KEY (CustomerId)
     * &UNIQUE (UserEmail, UserName)
	 */
	app.post('/register/addNewUser', function(req, resp) {
		dbConnection.getConnection(function (err, connection) {
			console.log(':::::::::::in mysql pool connection:::::::::::::');
			if (err) {
                //connection released
				connectionErrors.connectionError(err, connection);
			}	
            var dbConn = connection;		
			var reqData = registrationUtils.nullifyAllEmptyProperties(req.body);
            var validData = registrationUtils.validateRegistrationRequest(reqData);
            //get last row and get its CustomerId to generate CustomerId
            dbConnection.query('SELECT * FROM auth ORDER BY CustomerId DESC LIMIT 1', 
                function (err, rows) {
                    if (!err) {
                        console.log('::::::::::::::::::Got data last row::::::::::::::::::::');
                        if(rows.length > 0){
                            var stringRow = JSON.stringify(rows);
                            var jsonRow =  JSON.parse(stringRow);
                            var newCustomerId = jsonRow[0].CustomerId+1;
                        }else{
                            var newCustomerId = 1000;
                        }
                        registrationUtils.registerUserInit(newCustomerId, validData, dbConnection, reqData, connection, resp);
                    }else{                
                        connectionErrors.queryError(err, dbConn);
                    }
                });            
		});
	});


    /**
     * Backup API if API doesn't exist at all
     */
	app.get('/register/:id', function(req, res) {
		res.send('respond with a home data with id - '+ req.params.id);
	});    
    
	/*
     **Return middleware.
     */
    return function(req, res, next) {
        next();
    };
}