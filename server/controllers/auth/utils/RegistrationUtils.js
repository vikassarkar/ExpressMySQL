/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';


/**
 * Registration handler and curd operations 
 * @authenticateModels - request model for "/login/auth" 
 * @connectionErrors - generic db connection errors handler
 * @customErrors - generic custom errors handler
 * @envConfig - envirnoment required and configured variables
 * @async - node async module to handle parallel of serial calls
 * @bcrypt - used for hash encrypting password
 */
var registrationModels = require('../../../models/auth/RegistrationModels'),
    connectionErrors = require('../../../utilities/ConnectionErrors'),
    customErrors = require('../../../utilities/CustomErrors'),    
    envConfig = require('../../../configs/EnvConfig').envConfig,
    async = require('async'),
    bcrypt = require('bcrypt');

/**
 * Class for authenticating user, code needs to be connected before calling it
 * @param {*} dbConnection 
 * @param {*} reqData 
 * @param {*} resp 
 * @param {*} connection 
 */
var registerUser = function(dbConnection, reqData, resp, connection){
    var currentClass = this;
    var privateMethod = {};
    this.dbConnection = dbConnection;
    this.reqData = reqData;        
    this.resp = resp;
    this.connection = connection;
    this.authdetails = [];
    this.userdetails = [];
    this.newCustomerId = 1001;

    /**
     * @privillidged method
     * initilize authenticateUser methods
     */
    this.execute = function(){       
        privateMethod._generateCustomerId();
    };

    /**
     * @privillidged method
     * map request model schema
     */
    this.verifyModelSchema = function(){
        var isValidReq = true;
        var reqModel = registrationModels.signupIsRequiredModel;
        for(var index in currentClass.reqData){
            if(reqModel[index] === "required"){
                if(!currentClass.reqData[index]) 
                    isValidReq = false;
            }
        }
        return isValidReq;
    };

    /**
     * @privillidged method
     * convert all empty values in null
     */
    this.nullifyAllEmptyProperties = function(){
        var requestData = currentClass.reqData;
        for(var index in requestData){
            if(!requestData[index])
                requestData[index] = null;
        }
        return requestData;
    };

    /**
     * @private method
     * @DBQuery
     * query to get last user to generate next customer id
     */
    privateMethod._generateCustomerId = function(){
        dbConnection.query('SELECT * FROM auth ORDER BY CustomerId DESC LIMIT 1', 
            function (err, rows) {
                if (!err) {
                    console.log('::::::::::Got Last Customer on DB:::::::::::::');
                    if(rows.length > 0){
                        var stringRow = JSON.stringify(rows);
                        var jsonRow =  JSON.parse(stringRow);
                        currentClass.newCustomerId = jsonRow[0].CustomerId+1;
                    }
                    privateMethod._existingUserCheck();
                }else{                
                    connectionErrors.queryError(err, currentClass.connection);
                }
            }
        );
    };

    /**
     * @private method
     * @DBQuery
     * query to check if user already exist with same email or username
     */
    privateMethod._existingUserCheck = function(){
        dbConnection.query('SELECT * from auth WHERE UserEmail=? or UserName=?',
            [currentClass.reqData.UserEmail, currentClass.reqData.UserName], 
            function(err, rows, fields){                        
                if (!err) {
                    console.log(':::::::Got existing user aray::::::::::');
                    if(rows.length > 0){
                        //connection released
                        customErrors.userExist(currentClass.resp, currentClass.connection);
                    }else{                             
                        privateMethod._bycryptPassword();
                    }                        
                }else{
                    //connection released                
                    connectionErrors.queryError(err, currentClass.connection);
                }
            }
        );
    };
    
    /**
     * @private method
     * encrypt password before saving it to DB
     */
    privateMethod._bycryptPassword = function(){
        bcrypt.hash(reqData.UserPassword, envConfig.hashSaltRounds).then(function(hashPassword) {
            console.log(':::::::Got Hash password::::::::');
            var registerPayload = privateMethod._createRegisterPayload(hashPassword);
            if(registerPayload){
               privateMethod._insertAuthDetails(registerPayload);
            }else{
                //connection released
                customErrors.cannotSaveUser(currentClass.resp, currentClass.connection);
            }
        }, function(err){
            console.log('::::::Got Error in Hash password::::::');
            //connection released
            customErrors.cannotSaveUser(currentClass.resp, currentClass.connection);
        });
    };

    /**
     * @private method
     * create user to be register's payload
     */
    privateMethod._createRegisterPayload = function(hashPassword){
        var registerPayload= {
            reqUsersQuery : {
                CustomerId:currentClass.newCustomerId,            
                //UserEmail:currentClass.reqData.UserEmail,                                  
                LastName:currentClass.reqData.LastName,
                FirstName:currentClass.reqData.FirstName,
                DateOfBirth:currentClass.reqData.DateOfBirth,
                Gender:currentClass.reqData.Gender,
                PhoneNumber:currentClass.reqData.PhoneNumber,
                AlternatePhoneNumber:currentClass.reqData.AlternatePhoneNumber,
                Address:currentClass.reqData.Address,
                City:currentClass.reqData.City,
                PostalCode:currentClass.reqData.PostalCode,
                Country:currentClass.reqData.Country,
                IsDeleted: false
            },
            reqAuthQuery : {
                CustomerId:currentClass.newCustomerId,
                UserEmail:currentClass.reqData.UserEmail,
                UserName:currentClass.reqData.UserName,
                UserPassword:hashPassword
            }
        }

        return registerPayload.reqAuthQuery.UserEmail && registerPayload.reqAuthQuery.UserName ? registerPayload : false;
    }

    /** 
     * @private method
     * @DBQuery
     * Insert data in auth table 
     */
    privateMethod._insertAuthDetails = function(registerPayload){

        dbConnection.query('INSERT INTO auth SET ?', 
            registerPayload.reqAuthQuery, 
            function(err, rows, fields) {
                if (!err){ 
                    console.log(':::::::Inserted Auth data:::::::::');
                    privateMethod._insertUsersDetails(registerPayload);
                }else{
                    //connection released                
                    connectionErrors.queryError(err, currentClass.connection);
                }
            }
        );
    };

    /**
     * @private method
     * @DBQuery
     * Insert data in users table 
     */
    privateMethod._insertUsersDetails = function(registerPayload){

        dbConnection.query('INSERT INTO users SET ?', 
            registerPayload.reqUsersQuery, 
            function(err, rows, fields) {
                if (!err){                    
                    console.log(':::::::Inserted Users data:::::::::');
                    currentClass.resp.send({success:{
                        data:true,
                        key:'signup',
                        userDetails:{
                            username:currentClass.reqData.UserName,
                            useremail:currentClass.reqData.UserEmail,
                            customerid:currentClass.newCustomerId
                        },
                        message:"Users details were succesfully saved"
                    }});
                }else{                                                                        
                    privateMethod._deleteInsertedData();
                }
        })
    };
    
    /**
     * @private method
     * @DBQuery
     * delete row which was unable to add or was partially added in either of table
     */
    privateMethod._deleteInsertedData = function(){
        async.parallel([
            function(parallel_done) {
                dbConnection.query('DELETE FROM auth WHERE CustomerId = ?',
                [currentClass.reqAuthQuery.CustomerId], 
                function(err, rows, fields) {
                    if (err){ 
                        return parallel_done(err);
                    }else{
                        console.log(':::::::::deleted auth:::::::::::');
                        parallel_done();
                    }
                })                                            
            },
            function(parallel_done) {
                dbConnection.query('DELETE FROM users WHERE CustomerId = ?', 
                [currentClass.reqUsersQuery.CustomerId],
                function(err, rows, fields) {
                    if (err){ 
                        return parallel_done(err);
                    }else{
                        console.log('::::::::deleted users:::::::::');
                        parallel_done();
                    }
                })
            }
            ], function(err) {
                if (err){
                    //connection released
                    connectionErrors.queryError(err, currentClass.connection);
                }else{
                    //connection released
                    customErrors.cannotSaveUser(currentClass.resp, currentClass.connection);
                }
            }
        );
    };

}

/**
 * Export all exposable Class
 */
module.exports = {    
    'registerUser' : registerUser    
}