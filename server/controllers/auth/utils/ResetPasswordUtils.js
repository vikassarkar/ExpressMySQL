'use strict';

var authenticateModels = require('../../../models/auth/AuthenticateModels'),
    connectionErrors = require('../../../utilities/ConnectionErrors'),
    customErrors = require('../../../utilities/CustomErrors'),
    async = require('async'),
    bcrypt = require('bcrypt');


var _updateOldPasswordsList = function(authdetails){
    var oldpasswords = authdetails[0].OldPasswords.split('___');
    //if last pwd is current pwd dont change and return
    if(oldpasswords[oldpasswords.length - 1] == authdetails[0].UserPassword){
        return {oldpasswords: oldpasswords, changed:false};
    }else{
        if(oldpasswords.length == 3){
            oldpasswords.shift();
            oldpasswords.push(authdetails[0].UserPassword)
        }else{
            oldpasswords.push(authdetails[0].UserPassword)
        }
        return {oldpasswords: oldpasswords, changed:true};
    }

}


/**
 * Compare hash password
 */
var _changePassword = function (dbConnection, reqData, authdetails, resp, connection) {
    var oldpwdStr = _updateOldPasswordsList(authdetails);
    if(oldpwdStr.change){
        //update old paswwords list
        dbConnection.query('UPDATE auth SET Oldpasswords = ? WHERE CustomerId = ?',
            [oldpwdStr.oldpasswords.join('___'), authdetails[0].CustomerId],
            function (err, rows, fields) {
                console.log(':::::::::::::in saving Old Password:::::::::::::');
                if (!err) {
                    console.log(':::::::::::::Old Password saved:::::::::::::');
                    //match temp password
                    _mapTempPassword(dbConnection, reqData, authdetails, oldpwdStr.oldpasswords, resp, connection);
                } else {
                    console.log(':::::::::::::Cannot save Old Password:::::::::::::');
                    //connection released                
                    connectionErrors.queryError(err, connection);
                }
            }
        );
    }else{
        console.log('::::::::::::::::maptemp pass:::::::::::::::::::');
        _mapTempPassword(dbConnection, reqData, authdetails, oldpwdStr.oldpasswords, resp, connection);
    }
}

var _mapTempPassword = function(dbConnection, reqData, authdetails, oldpasswords, resp, connection){
    if (authdetails[0].TemporaryPassword && reqData.TemporaryPassword == authdetails[0].TemporaryPassword) {
        console.log('::::::::::::::temp matched::::::::::::::::');  
        _mapWithPreviousThreePassword(dbConnection, reqData, authdetails, oldpasswords, resp, connection);
    }else{
        console.log('::::::::::::::temp not matched::::::::::::::::');        
        connection.release();
        resp.send('temp not matched');
    }
}

/**
 * get users details to pass on authentication succesful
 */
var _mapWithPreviousThreePassword = function (dbConnection, reqData, authdetails, oldpasswords, resp, connection) {
    var oldpasswordMatched = false;
    var matchRound = 0;
    console.log(oldpasswords)
    for (var index in oldpasswords) {
        bcrypt.compare(reqData.UserPassword, oldpasswords[index]).then(function (res) {
            if (res) {
                oldpasswordMatched = true;
                //connection released
                customErrors.usernamePasswordMismatch(resp, connection);
            } else {
                matchRound = index + 1;
            }
            if (Object.keys(oldpasswords).length == matchRound && !oldpasswordMatched) {
                _saveNewPassword(dbConnection, reqData, authdetails, resp, connection);
            }
        }, function (err) {
            //connection released
            customErrors.cannotSaveUser(resp, connection);
        });
    }
}

var _saveNewPassword = function (dbConnection, reqData, authdetails, resp, connection) {
    bcrypt.hash(reqData.UserPassword, envConfig.hashSaltRounds).then(function (hashPassword) {
        console.log('::::::::::::::::::Got Hash password::::::::::::::::::');
        dbConnection.query('UPDATE auth SET UserPassword = ? WHERE CustomerId = ?',
            [hashPassword, authdetails[0].CustomerId],
            function (err, rows, fields) {
                console.log(':::::::::::::in saving Temp Password:::::::::::::');
                if (!err) {
                    console.log(':::::::::::::Temp Password saved:::::::::::::');
                    resp.send('passwordSaved')
                } else {
                    console.log(':::::::::::::Cannot save Temp Password:::::::::::::');
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

module.exports = {
    'changePassword': _changePassword,
}