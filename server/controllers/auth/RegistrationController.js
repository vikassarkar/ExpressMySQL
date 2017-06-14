/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';


/**
 * Registration api url handler
 * @connectionErrors - generic db connection errors handler
 * @customErrors - generic custom errors handler
 * @registrationUtils - registration utility functions for all data manupulation and curd operations
 */
var connectionErrors = require('../../utilities/ConnectionErrors'),
    customErrors = require('../../utilities/CustomErrors'),
    registrationUtils = require('./utils/RegistrationUtils');

module.exports = function(app, route, dbConnection){

	/**
	 * test api to check if URL for API's are working
	 */
	app.get('/register/init', function (req, resp) {
		resp.send('<h1 style="color:green">Node hosted sucessfully</h1><p>you can now jump to API.</p>');
	});

	/**
	 * Register user in with provided params
	 * @req - request params for api
	 * @resp - response tobe send
	 * @req param {*} UserEmail: provided String param for usremail
	 * @req param {*} UserName: provided String param for username
	 * @req param {*} UserPassword: provided String param for password
	 * @req param {*} LastName: provided String param for Last name
	 * @req param {}  FirstName: provided String param for First name
	 * @req param {}  DateOfBirth: provided Date param for date of birth
	 * @req param {*} Gender: provided String param for gender
	 * @req param {*} PhoneNumber: provided String param for contact number
	 * @req param {*} AlternatePhoneNumber: provided String param for alternate contact number
	 * @req param {}  Address: provided String param for  Residential address
	 * @req param {*} City: provided String param for city
	 * @req param {*} PostalCode: provided String param for  postal code
	 * @req param {*} Country: provided String param for country
	 * @req param {} IsDeleted: provided Boolean param that this user is deleted or existing
	 */
	app.post('/register/addNewUser', function(req, resp) {
		dbConnection.getConnection(function (err, connection) {
			console.log(':::::in mysql pool connection:::::::');
			if (err) {
                //connection released
				connectionErrors.connectionError(err, connection);
			}else{
                var reqData = req.body;
                var registerUser = new registrationUtils.registerUser(dbConnection, reqData, resp, connection)	
                var reqData = registerUser.nullifyAllEmptyProperties();
                var validData = registerUser.verifyModelSchema();                
                if(validData){
                    registerUser.execute();  
                }else{
                    //connection released
                    customErrors.modelMismatch(resp, connection)
                }
            }
		});
	});


	/**
     * Backup API if API doesn't exist at all
	 * @req - request params for api
	 * @resp - response tobe send
     */
	app.get('/register/:id', function(req, res) {
		res.send('respond with a home data with id - '+ req.params.id);
	});    
    
	/**
	 * Return middleware.
	 */
    return function(req, res, next) {
        next();
    };
}