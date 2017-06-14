/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * Login handler and curd operations 
 * @authenticateModels - request model for "/login/auth" 
 * @connectionErrors - generic db connection errors handler
 * @customErrors - generic custom errors handler
 * @bcrypt - used for hash encrypting password
 */
var authenticateModels = require('../../../models/auth/AuthenticateModels'),
    connectionErrors = require('../../../utilities/ConnectionErrors'),
    customErrors = require('../../../utilities/CustomErrors'),
    bcrypt = require('bcrypt');

/**
 * Class for authenticating user, code needs to be connected before calling it
 * @param {*} dbConnection 
 * @param {*} reqData 
 * @param {*} resp 
 * @param {*} connection 
 */
var authenticateUser = function(dbConnection, reqData, resp, connection){
    var currentClass = this;
    var privateMethod = {};
    this.dbConnection = dbConnection;
    this.reqData = reqData;        
    this.resp = resp;
    this.connection = connection;
    this.authdetails = [];
    this.userdetails = [];

    /**
     * @privillidged method
     * initilize authenticateUser methods
     */
    this.execute = function(){       
        privateMethod._getAuthUser();
    };

    /**
     * @private method
     * @DBQuery
     * query to get authdetails
     */
    privateMethod._getAuthUser = function(){
        dbConnection.query('SELECT * from auth WHERE UserEmail=? or UserName=?',
        [currentClass.reqData.UserEmail, currentClass.reqData.UserName], 
            function(err, authdetails, fields){				
                if (!err) {
                    console.log(':::::::Got authdetails::::::::');
                    currentClass.authdetails = authdetails;
                    //call to compare encrypted password
                    privateMethod._compareUserCredentials();
                }else{                
                    connectionErrors.queryError(err, currentClass.connection);
                }
            }
        );
    };

    /**
     * @private method
     * Compare hash password
     */
    privateMethod._compareUserCredentials = function(){
        if(currentClass.authdetails.length == 1){
            bcrypt.compare(currentClass.reqData.UserPassword, currentClass.authdetails[0].UserPassword).then(function(res) {
                if(res){
                    //call to get user details and return response                    
                    privateMethod._getUserDetails()                    
                }else{
                    //connection released
                    privateMethod.customErrors.usernamePasswordMismatch(currentClass.resp, currentClass.connection);
                }
            }, function(err){
                //connection released
                customErrors.cannotSaveUser(currentClass.resp, currentClass.connection);
            });
        }else if(authdetails.length == 0){
                //connection released
                customErrors.usernamePasswordMismatch(currentClass.resp, currentClass.connection);
        }else{
            //connection released
            customErrors.multipleUsers(currentClass.resp, currentClass.connection);
        }
    };

    /**
     * @private method
     * @DBQuery
     * get users details to pass on authentication succesful
     */
    privateMethod._getUserDetails = function(){
        dbConnection.query('SELECT * from users WHERE CustomerId = ?',
        [currentClass.authdetails[0].CustomerId], 
            function(err, userdetails, fields){            
                if (!err) {
                    console.log('::::::::::::::::::User Loggedin::::::::::::::::::');
                    currentClass.userdetails = userdetails;
                    var success = {
                        success:{
                                data:true,
                                userDetails:{                 
                                    email:currentClass.authdetails[0].UserEmail,
                                    lastname: currentClass.userdetails[0].LastName,
                                    firstname: currentClass.userdetails[0].FirstName,
                                    CustomerId: currentClass.authdetails[0].CustomerId
                                },              
                                key:'Loggedin',
                                message:"Users successfully loggedin"
                        }
                    }     
                    //connection released
                    connection.release();
                    resp.send(success);
                }else{
                    //connection released
                    connectionErrors.queryError(err, currentClass.connection);
                }
            }
        );
    };
}

/**
 * Export all exposable Class
 */
module.exports = {    
    'authenticateUser' : authenticateUser,
}