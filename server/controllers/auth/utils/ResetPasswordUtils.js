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
 * Class for authenticating user, code needs to be connected before calling it
 * @param {*} dbConnection 
 * @param {*} reqData 
 * @param {*} resp 
 * @param {*} connection 
 */
var resetTemporaryPassword = function(dbConnection, reqData, resp, connection){
    var currentClass = this;
    var privateMethod = {};
    this.dbConnection = dbConnection;
    this.reqData = reqData;        
    this.resp = resp;
    this.connection = connection;
    this.oldpasswords = [];
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
     * check if user had provided proper TempPassword
     */
    privateMethod._checkTempPassword = function(){
        if (currentClass.authdetails[0].TempPassword && currentClass.reqData.TempPassword == currentClass.authdetails[0].TempPassword) {
            console.log(':::::temp matched::::::');  
            privateMethod._mapWithPreviousThreePassword();
        }else{
            console.log('::::temp not matched:::::');   
            //connection released       
            currentClass.connection.release();
            currentClass.resp.send('temp not matched');
        }
    };

    /**
     * @private method
     * @DBQuery
     * query to get authdetails
     */
    privateMethod._getAuthUser = function(){
        dbConnection.query('SELECT * from auth WHERE UserEmail=? or UserName=?',
			[reqData.UserEmail, reqData.UserName], 
				function(err, authdetails, fields){					
					if (!err) {
						console.log(':::::Got auth data::::::');
                        currentClass.authdetails = authdetails;
						privateMethod._setOldPasswordsList();
					}else{                
                        //connection released    
						connectionErrors.queryError(err, connection);
					}
				}
		);
    };

    /**
     * @private method
     * Get Old passwords list and check updation of it
     */
    privateMethod._setOldPasswordsList = function(){
        var oldpasswords = currentClass.authdetails[0].OldPasswords ? currentClass.authdetails[0].OldPasswords.split('___') : [];
        console.log(":::::compare last passd with current:::::::::");

        if(oldpasswords.length > 0 && oldpasswords[oldpasswords.length - 1] == currentClass.authdetails[0].UserPassword){
            console.log(':::::old passwords up to date:::::');
            currentClass.oldpasswords = oldpasswords;
            //match temp password
            privateMethod._checkTempPassword();
        }else{
            if(oldpasswords.length == 3){
                oldpasswords.shift();
                oldpasswords.push(currentClass.authdetails[0].UserPassword)
            }else{
                oldpasswords.push(currentClass.authdetails[0].UserPassword)
            }
            currentClass.oldpasswords = oldpasswords;
            privateMethod._updateOldPasswordsList();
        }
    };

   /**
     * @private method
     * @DBQuery
     * updating old password list in DB
     */
    privateMethod._updateOldPasswordsList = function(){
        dbConnection.query('UPDATE auth SET Oldpasswords = ? WHERE CustomerId = ?',
            [currentClass.oldpasswords.join('___'), currentClass.authdetails[0].CustomerId],
            function (err, rows, fields) {
                if (!err) {
                    console.log('::::::Old Password saved:::::');
                    //match temp password
                    privateMethod._checkTempPassword();
                } else {
                    //connection released                
                    connectionErrors.queryError(err, currentClass.connection);
                }
            }
        );
    };
    
   /**
     * @private method
     * map New password with three old passwords
     */
    privateMethod._mapWithPreviousThreePassword = function () {
        if(Object.keys(currentClass.oldpasswords).length > 0){

            //Mapping first old password
            bcrypt.compare(currentClass.reqData.UserPassword, currentClass.oldpasswords[0]).then(function (res) {
                console.log("::::::Old pwd check 1:::::::");
                if(!res){
                    if(Object.keys(currentClass.oldpasswords).length > 1){

                        //Mapping second old password
                        bcrypt.compare(currentClass.reqData.UserPassword, currentClass.oldpasswords[1]).then(function (res1) {
                           console.log("::::::Old pwd check 2:::::::");
                            if(!res1){
                                if(Object.keys(currentClass.oldpasswords).length > 2){

                                    //Mapping third old password
                                    bcrypt.compare(currentClass.reqData.UserPassword, currentClass.oldpasswords[2]).then(function (res2) {
                                        
                                        console.log("::::::Old pwd check 3:::::::");
                                        if(!res2){
                                            privateMethod._saveNewPassword();
                                        }else{
                                            //connection released
                                            customErrors.NewPasswordMatchedOld(currentClass.resp, currentClass.connection);
                                        }
                                    }, function (err) {
                                        console.log(':::::error in bycryption::::::')
                                        //connection released
                                        customErrors.cannotSaveUser(currentClass.resp, currentClass.connection);
                                    });
                                }else{
                                    privateMethod._saveNewPassword();                                
                                }
                            }else{
                                //connection released
                                customErrors.NewPasswordMatchedOld(currentClass.resp, currentClass.connection);
                            }
                        }, function (err) {
                            console.log(':::::error in bycryption::::::')
                            //connection released
                            customErrors.cannotSaveUser(resp, connection);
                        });
                    }else{                    
                        privateMethod._saveNewPassword();
                    }
                }else{
                    //connection released
                    customErrors.NewPasswordMatchedOld(currentClass.resp, currentClass.connection);
                }
            }, function (err) {
                console.log(':::::error in bycryption:::::::')
                //connection released
                customErrors.cannotSaveUser(currentClass.resp, currentClass.connection);
            });
        }else{
            privateMethod._saveNewPassword();
        }
    };

    
   /**
     * @private method
     * @DBQuery
     * Save New password in DB
     */
    privateMethod._saveNewPassword = function () {
        bcrypt.hash(currentClass.reqData.UserPassword, envConfig.hashSaltRounds).then(function (hashPassword) {
            dbConnection.query('UPDATE auth SET UserPassword = ? WHERE CustomerId = ?',
                [hashPassword, currentClass.authdetails[0].CustomerId],
                function (err, rows, fields) {
                    if (!err) {
                        console.log('::::New Password saved:::::');
                        privateMethod._removeTempPassword()
                    } else {
                        //connection released                
                        connectionErrors.queryError(err, currentClass.connection);
                    }
                }
            );
        }, function (err) {
            //connection released
            customErrors.cannotSaveUser(currentClass.resp, currentClass.connection);
        });
    };

   /**
     * @private method
     * @DBQuery
     * Remove temp password if New password saved
     */
    privateMethod._removeTempPassword = function(){
        dbConnection.query('UPDATE auth SET TempPassword = ? WHERE CustomerId = ?',
            [null, currentClass.authdetails[0].CustomerId],
            function (err, rows, fields) {
                if (!err) {
                    console.log(':::::Temp Password Removed::::::');
                    resp.send('passwordSaved')

                } else {
                    //connection released                
                    connectionErrors.queryError(err, connection);
                }
            }
        );
    };

}

/**
 * Export all exposable Class
 */
module.exports = {
    'resetTemporaryPassword': resetTemporaryPassword,
}