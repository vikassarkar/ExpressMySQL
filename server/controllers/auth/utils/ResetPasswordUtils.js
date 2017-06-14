/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

var authenticateModels = require('../../../models/auth/AuthenticateModels'),
    connectionErrors = require('../../../utilities/ConnectionErrors'),
    customErrors = require('../../../utilities/CustomErrors'),  
    envConfig = require('../../../configs/EnvConfig').envConfig,
    async = require('async'),
    bcrypt = require('bcrypt');


/**
 * Get Old passwords list and check updation of it
 */
var _getOldPasswordsList = function(dbConnection, reqData, authdetails, resp, connection){

    var oldpasswords = authdetails[0].OldPasswords ? authdetails[0].OldPasswords.split('___') : [];
    console.log("::::::::::::compared last passd with current::::::::::::");

    if(oldpasswords.length > 0 && oldpasswords[oldpasswords.length - 1] == authdetails[0].UserPassword){
        console.log('::::::::::old passwords up to date::::::::::')
        //match temp password
        _mapTempPassword(dbConnection, reqData, authdetails, oldpasswords, resp, connection);
    }else{
        if(oldpasswords.length == 3){
            oldpasswords.shift();
            oldpasswords.push(authdetails[0].UserPassword)
        }else{
            oldpasswords.push(authdetails[0].UserPassword)
        }
        console.log(':::::::::::::update Old Password:::::::::::::');
        _updateOldPasswordsList(dbConnection, oldpasswords, reqData, authdetails, resp, connection);
    }

}

/**
 * updating old password list in DB
 */
var _updateOldPasswordsList = function(dbConnection, oldpasswords, reqData, authdetails, resp, connection){
    //update old paswwords list
    dbConnection.query('UPDATE auth SET Oldpasswords = ? WHERE CustomerId = ?',
        [oldpasswords.join('___'), authdetails[0].CustomerId],
        function (err, rows, fields) {
            console.log(':::::::::::::in saving Old Password:::::::::::::');
            if (!err) {
                console.log(':::::::::::::Old Password saved:::::::::::::'+oldpasswords.join('___'));
                //match temp password
                _mapTempPassword(dbConnection, reqData, authdetails, oldpasswords, resp, connection);
            } else {
                console.log(':::::::::::::Cannot save Old Password:::::::::::::');
                //connection released                
                connectionErrors.queryError(err, connection);
            }
        }
    );
}

/**
 * Compare hash password
 */
var _changePassword = function (dbConnection, reqData, authdetails, resp, connection) {
    _getOldPasswordsList(dbConnection, reqData, authdetails, resp, connection);
}

/**
 * check if user had provided proper TempPassword
 */
var _mapTempPassword = function(dbConnection, reqData, authdetails, oldpasswords, resp, connection){
    console.log(authdetails[0].TempPassword)
    console.log(reqData.TempPassword)
    if (authdetails[0].TempPassword && reqData.TempPassword == authdetails[0].TempPassword) {
        console.log('::::::::::::::temp matched::::::::::::::::');  
        _mapWithPreviousThreePassword(dbConnection, reqData, authdetails, oldpasswords, resp, connection);
    }else{
        console.log('::::::::::::::temp not matched::::::::::::::::');   
        //connection released       
        connection.release();
        resp.send('temp not matched');
    }
}

/**
 * map New password with three old passwords
 */
var _mapWithPreviousThreePassword = function (dbConnection, reqData, authdetails, oldpasswords, resp, connection) {
    if(Object.keys(oldpasswords).length > 0){

        //Mapping first old password
        bcrypt.compare(reqData.UserPassword, oldpasswords[0]).then(function (res) {
            console.log(":::::::::::::response1:::::::::::::"+oldpasswords[0]+"::::"+res)
            if(!res){
                if(Object.keys(oldpasswords).length > 1){

                    //Mapping second old password
                    bcrypt.compare(reqData.UserPassword, oldpasswords[1]).then(function (res1) {
                        console.log("::::::::::::::::response2:::::::::::"+oldpasswords[1]+"::::"+res)
                        if(!res1){
                            if(Object.keys(oldpasswords).length > 2){

                                //Mapping third old password
                                bcrypt.compare(reqData.UserPassword, oldpasswords[2]).then(function (res2) {
                                    
                                    console.log("::::::::::::::::response3::::::::::::::::"+oldpasswords[2]+"::::"+res)
                                    if(!res2){
                                        _saveNewPassword(dbConnection, reqData, authdetails, resp, connection);
                                    }else{
                                        //connection released
                                        customErrors.NewPasswordMatchedOld(resp, connection);
                                    }
                                }, function (err) {
                                    console.log('::::::::::::error in bycryption::::::::::::')
                                    //connection released
                                    customErrors.cannotSaveUser(resp, connection);
                                });
                            }else{
                                _saveNewPassword(dbConnection, reqData, authdetails, resp, connection);                                
                            }
                        }else{
                            //connection released
                            customErrors.NewPasswordMatchedOld(resp, connection);
                        }
                    }, function (err) {
                        console.log('::::::::::::error in bycryption::::::::::::')
                        //connection released
                        customErrors.cannotSaveUser(resp, connection);
                    });
                }else{                    
                    _saveNewPassword(dbConnection, reqData, authdetails, resp, connection);
                }
            }else{
                //connection released
                customErrors.NewPasswordMatchedOld(resp, connection);
            }
        }, function (err) {
            console.log('::::::::::::error in bycryption::::::::::::')
            //connection released
            customErrors.cannotSaveUser(resp, connection);
        });
    }else{
        _saveNewPassword(dbConnection, reqData, authdetails, resp, connection);
    }
    
}

/**
 * Save New password in DB
 */
var _saveNewPassword = function (dbConnection, reqData, authdetails, resp, connection) {
    bcrypt.hash(reqData.UserPassword, envConfig.hashSaltRounds).then(function (hashPassword) {
        console.log('::::::::::::::::::Got Hash password::::::::::::::::::');
        dbConnection.query('UPDATE auth SET UserPassword = ? WHERE CustomerId = ?',
            [hashPassword, authdetails[0].CustomerId],
            function (err, rows, fields) {
                console.log(':::::::::::::in saving New Password:::::::::::::');
                if (!err) {
                    console.log(':::::::::::::New Password saved:::::::::::::');
                    _removeTempPassword(dbConnection, reqData, authdetails, resp, connection)
                } else {
                    console.log(':::::::::::::Cannot save New Password:::::::::::::');
                    //connection released                
                    connectionErrors.queryError(err, connection);
                }
            }
        );
    }, function (err) {
        console.log('::::::::::::Got Error in Hash password:::::::::::::::');
        //connection released
        customErrors.cannotSaveUser(resp, connection);
    });
}

/**
 * Remove temp password if New password saved
 */
var _removeTempPassword = function(dbConnection, reqData, authdetails, resp, connection){
    dbConnection.query('UPDATE auth SET TempPassword = ? WHERE CustomerId = ?',
        [null, authdetails[0].CustomerId],
        function (err, rows, fields) {
            if (!err) {
                console.log(':::::::::::::Temp Password Removed:::::::::::::');
                resp.send('passwordSaved')

            } else {
                //connection released                
                connectionErrors.queryError(err, connection);
            }
        }
    );
}

module.exports = {
    'changePassword': _changePassword,
}