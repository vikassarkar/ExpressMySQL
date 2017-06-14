/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/** 
 * validate request data
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
 * &PRIMARY KEY (CustomerId)
 * &UNIQUE (UserEmail, UserName)
 */

var registrationModels = require('../../../models/auth/RegistrationModels'),
    connectionErrors = require('../../../utilities/ConnectionErrors'),
    customErrors = require('../../../utilities/CustomErrors'),    
    envConfig = require('../../../configs/EnvConfig').envConfig,
    async = require('async'),
    bcrypt = require('bcrypt');

/**
 * validate if all required feilds from model are passed in request
 */
var _validateRegistrationRequest = function(reqData){
    var isValidReq = true;
    var reqModel = registrationModels.signupIsRequiredModel;
    for(var index in reqData){
        if(reqModel[index] === "required"){
            if(!reqData[index]) 
                isValidReq = false;
        }
    }
    return isValidReq;
}
/**
 * convert all empty values in null
 */
var _nullifyAllEmptyProperties = function(reqData){
    var requestData = reqData;
    for(var index in requestData){
        if(!requestData[index])
            requestData[index] = null;
    }
    return requestData;
}

/**
 *init and start registration process
 */
var _registerUserInit = function(newCustomerId, validData, dbConnection, reqData, connection, resp){
    if(validData){
        dbConnection.query('SELECT * from auth WHERE UserEmail=? or UserName=?',
            [reqData.UserEmail, reqData.UserName], 
            function(err, rows, fields){                        
                if (!err) {
                    console.log(':::::::::::::Got data query-1:::::::::::::');
                    if(rows.length > 0){
                        //connection released
                        customErrors.userExist(resp, connection);
                    }else{     
                        //all other initilize, insert and delete queries are fragmently handled in registrationutils        
                        _bycryptAndSave(reqData, newCustomerId, dbConnection, connection, resp);
                    }                        
                }else{
                    //connection released                
                    connectionErrors.queryError(err, connection);
                }
            }
        );
    }else{
        //connection released
        customErrors.modelMismatch(resp, connection);
    }
}

/**
 * encrypt password before saving
 */
var _bycryptAndSave = function(reqData, newCustomerId, dbConnection, connection, resp){
    bcrypt.hash(reqData.UserPassword, envConfig.hashSaltRounds).then(function(hashPassword) {
        console.log('::::::::::::::::::Got Hash password::::::::::::::::::');
        var queryData = _initilizeRegistration(hashPassword, newCustomerId, reqData, dbConnection, connection, resp);
        if(queryData)
            _authTableInsertQuery(dbConnection, queryData.reqAuthQuery, queryData.reqUsersQuery, connection, resp);
        else
            //connection released
            customErrors.cannotSaveUser(resp, connection);
    }, function(err){
        console.log('::::::::::::Got Error in Hash password:::::::::::::::');
        //connection released
        customErrors.cannotSaveUser(resp, connection);
    });
}

/**
 * initilize all data to be registered
 */
var _initilizeRegistration = function(hashPassword, newCustomerId, reqData, dbConnection, connection, resp){
    var queryData= {
        reqUsersQuery : {
            CustomerId:newCustomerId,            
            UserEmail:reqData.UserEmail,                                  
            LastName:reqData.LastName,
            FirstName:reqData.FirstName,
            DateOfBirth:reqData.DateOfBirth,
            Gender:reqData.Gender,
            PhoneNumber:reqData.PhoneNumber,
            AlternatePhoneNumber:reqData.AlternatePhoneNumber,
            Address:reqData.Address,
            City:reqData.City,
            PostalCode:reqData.PostalCode,
            Country:reqData.Country,
            IsDeleted: false
        },
        reqAuthQuery : {
            CustomerId:newCustomerId,
            UserEmail:reqData.UserEmail,
            UserName:reqData.UserName,
            UserPassword:hashPassword
        }
    }
    console.log('::::::::::::::::::::Initilization:::::::::::::::::::::::');
    return queryData.reqAuthQuery.UserEmail || queryData.reqAuthQuery.UserName ? queryData : false;
}

/** 
 * Insert users data in auth table 
 */
var _authTableInsertQuery = function(dbConnection, reqAuthQuery, reqUsersQuery, connection, resp){
     /**
     * first insert in DB of auth table
     */
    dbConnection.query('INSERT INTO auth SET ?', 
        reqAuthQuery, 
        function(err, rows, fields) {
            if (err){ 
                //connection released                
                connectionErrors.queryError(err, connection);
            }else{
                console.log('::::::::::::::Got data query-auth:::::::::::::');
                _usersTableInsertQuery(dbConnection, reqAuthQuery, reqUsersQuery, connection, resp);
            }
    })
}

/**
 * Insert users data in users table 
 */
var _usersTableInsertQuery = function(dbConnection, reqAuthQuery, reqUsersQuery, connection, resp){
     /**
     * Second insert in DB of users table
     */
    dbConnection.query('INSERT INTO users SET ?', 
        reqUsersQuery, 
        function(err, rows, fields) {
            if (err){ 
                /**
                * delete row from both table as Second insert in DB of users table failed
                */                                                    
                _deleteAllTableRowQuery(dbConnection, reqAuthQuery, reqUsersQuery, connection, resp);
            }else{
                console.log(':::::::::::::Got data query-users::::::::::::');
                resp.send({success:{
                    data:true,
                    key:'signup',
                    message:"Users details were succesfully saved"
                }});
            }
    })
}

/**
 * delete row which was unable to add or was partially added in either of table
 */
var _deleteAllTableRowQuery = function(dbConnection, reqAuthQuery, reqUsersQuery, connection, resp){
    var return_data = {};
    async.parallel([
        function(parallel_done) {
            dbConnection.query('DELETE FROM auth WHERE CustomerId = ?',
            [reqAuthQuery.CustomerId], 
            function(err, rows, fields) {
                if (err){ 
                    return parallel_done(err);
                }else{
                    console.log('::::::::::::::::deleted auth::::::::::::::')
                    return_data['authDetails'] = {success:{
                        data:true,
                        key:'auth',
                        message:"auth row deleted"
                    }};
                    parallel_done();
                }
            })                                            
        },
        function(parallel_done) {
            dbConnection.query('DELETE FROM users WHERE CustomerId = ?', 
            [reqUsersQuery.CustomerId],
            function(err, rows, fields) {
                if (err){ 
                    return parallel_done(err);
                }else{
                    console.log('::::::::::::::deleted users::::::::::::')
                    return_data['userDetails'] = {success:{
                        data:true,
                        key:'users',
                        message:"users row deleted"
                    }};
                    parallel_done();
                }
            })
        }
        ], function(err) {
            if (err){
                //connection released
                connectionErrors.queryError(err, connection);
            }else{
                //connection released
                customErrors.cannotSaveUser(resp, connection);
            }
        }
    );
}


module.exports = {    
    'validateRegistrationRequest' : _validateRegistrationRequest,
    'nullifyAllEmptyProperties':_nullifyAllEmptyProperties,
    'registerUserInit': _registerUserInit,
    'bycryptAndSave': _bycryptAndSave,
    'initilizeRegistration':_initilizeRegistration,
    'authTableInsertQuery': _authTableInsertQuery,
    'usersTableInsertQuery' : _usersTableInsertQuery,
    'deleteAllTableRowQuery' : _deleteAllTableRowQuery
    
}