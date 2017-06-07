'use strict';

var authenticateModels = require('../../../models/auth/AuthenticateModels'),
    connectionErrors = require('../../../utilities/ConnectionErrors'),
    customErrors = require('../../../utilities/CustomErrors'),
    async = require('async'),
    bcrypt = require('bcrypt');


/**
 * Compare hash password
 */
var _comparePassword = function(dbConnection, reqData, authdetails, resp, connection){
    if(authdetails.length == 1){
        bcrypt.compare(reqData.UserPassword, authdetails[0].UserPassword).then(function(res) {
            if(res){
                var success = {
                    success:{
                            data:true,
                            key:'Loggedin',
                            message:"Users successfully loggedin"
                    }
                }
                _getUserDetails(dbConnection, authdetails, success, resp, connection)
                
            }else{
                //connection released
                customErrors.usernamePasswordMismatch(resp, connection);
            }
        }, function(err){
            //connection released
            customErrors.cannotSaveUser(resp, connection);
        });
    }else if(authdetails.length == 0){
            //connection released
            customErrors.usernamePasswordMismatch(resp, connection);
    }else{
        //connection released
        customErrors.multipleUsers(resp, connection);
    }
}

/**
 * get users details to pass on authentication succesful
 */
var _getUserDetails = function(dbConnection, authdetails, success, resp, connection){
    dbConnection.query('SELECT * from users WHERE CustomerId = ?',
    [authdetails[0].CustomerId], 
        function(err, userdetails, fields){            
            if (!err) {
                console.log('::::::::::::::::::User Loggedin::::::::::::::::::');
                success.success['userDetails'] = {                 
                    email:authdetails[0].UserEmail,
                    lastname: userdetails[0].LastName,
                    firstname: userdetails[0].FirstName
                }
                connection.release();
                resp.send(success);
            }else{
                //connection released
                connectionErrors.queryError(err, connection);
            }
        }
    );
}

module.exports = {    
    'comparePassword' : _comparePassword,
}