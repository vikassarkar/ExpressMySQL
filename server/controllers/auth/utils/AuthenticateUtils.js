/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
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
    var self = this;
    this.dbConnection = dbConnection;
    this.reqData = reqData;        
    this.resp = resp;
    this.connection = connection;
    this.authdetails = [];
    this.userdetails = [];

    /**
     * initilize authenticateUser methods
     */
    this.initilize = function(){       
        this._getAuthUser();
    };

    /**
     * query to get authdetails
     */
    this._getAuthUser = function(){
        dbConnection.query('SELECT * from auth WHERE UserEmail=? or UserName=?',
        [self.reqData.UserEmail, self.reqData.UserName], 
            function(err, authdetails, fields){				
                if (!err) {
                    console.log(':::::::Got authdetails::::::::');
                    self.authdetails = authdetails;
                    //call to compare encrypted password
                    self._compareUserCredentials();
                }else{                
                    connectionErrors.queryError(err, self.connection);
                }
            }
        );
    };

    /**
     * Compare hash password
     */
    this._compareUserCredentials = function(){
        if(self.authdetails.length == 1){
            bcrypt.compare(self.reqData.UserPassword, self.authdetails[0].UserPassword).then(function(res) {
                if(res){
                    //call to get user details and return response                    
                    self._getUserDetails()                    
                }else{
                    //connection released
                    customErrors.usernamePasswordMismatch(self.resp, self.connection);
                }
            }, function(err){
                //connection released
                customErrors.cannotSaveUser(self.resp, self.connection);
            });
        }else if(authdetails.length == 0){
                //connection released
                customErrors.usernamePasswordMismatch(self.resp, self.connection);
        }else{
            //connection released
            customErrors.multipleUsers(self.resp, self.connection);
        }
    };

    /**
     * get users details to pass on authentication succesful
     */
    this._getUserDetails = function(){
        dbConnection.query('SELECT * from users WHERE CustomerId = ?',
        [self.authdetails[0].CustomerId], 
            function(err, userdetails, fields){            
                if (!err) {
                    console.log('::::::::::::::::::User Loggedin::::::::::::::::::');
                    self.userdetails = userdetails;
                    var success = {
                        success:{
                                data:true,
                                userDetails:{                 
                                    email:self.authdetails[0].UserEmail,
                                    lastname: self.userdetails[0].LastName,
                                    firstname: self.userdetails[0].FirstName
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
                    connectionErrors.queryError(err, self.connection);
                }
            }
        );
    };

    /**
     * hit initilize function
     */
    this.initilize();
}
/**
 * Export all exposable methods
 */
module.exports = {    
    'authenticateUser' : authenticateUser,
}