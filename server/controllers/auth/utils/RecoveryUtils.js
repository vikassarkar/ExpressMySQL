/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * Recovery handler and curd operations 
 * @recoveryModels - request model for "/login/auth" 
 * @connectionErrors - generic db connection errors handler
 * @customErrors - generic custom errors handler
 * @recoveryEmails - html template tobe send to email
 * @credentialsConfig - all server/DB/email/messiging credentials
 * @generator - random unique temporary password generator node module
 * @nodemailer -  mailing node module
 * @envConfig -  getting all project configuration
 * @async -  asyncronously executing functions parralelly or serialy
 * @bcrypt -  encrypting password and comparying it
 */
var recoveryModels = require('../../../models/auth/RecoveryModels'),
    connectionErrors = require('../../../utilities/ConnectionErrors'),
    customErrors = require('../../../utilities/CustomErrors'),
    recoveryEmails = require('../../../views/emailTemplates/ResetPassword'),
    credentialsConfig = require('../../../configs/CredentialsConfig'),  
    generator = require('generate-password'),
    nodemailer = require('nodemailer'),
    envConfig = require('../../../configs/EnvConfig').envConfig,
    async = require('async'),
    bcrypt = require('bcrypt');

/****************SEND TEMP PASSWORD VIA MAIL CLASS*************/

/**
 * Class for authenticating user, code needs to be connected before calling it
 * @param {*} dbConnection 
 * @param {*} reqData 
 * @param {*} resp 
 * @param {*} connection 
 */
var emailTemporaryPassword = function(dbConnection, reqData, resp, connection){
    var currentClass = this;
    var privateMethod = {};
    this.dbConnection = dbConnection;
    this.reqData = reqData;        
    this.resp = resp;
    this.connection = connection;
    this.tempPassword = '';
    this.userFullName = '';
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
     * @privillidged method
     * generate temporary password
     */
    this.generateTempPassword = function () {
        var tempPass = generator.generate({
            length: 10,
            numbers: true
        });
        return tempPass;
    };

    /**
     * @privillidged method
     * set emailing configuration
     */
    this.setMailConfig = function () {
        var transporter = nodemailer.createTransport({
            host: credentialsConfig.SenderMail.host,
            port: 465,
            secure: true, // secure:true for port 465, secure:false for port 587
            debug: true,
            auth: {
                user: credentialsConfig.SenderMail.user,
                pass: credentialsConfig.SenderMail.pass
            }
        });
        return transporter;
    };

    /**
     * @privillidged method
     * get subject of mail
     */
    this.getMailSubject = function (mailCode) {
        var emailSub;
        switch (mailCode) {
            case 'Recovery':
                emailSub = 'Test - Your Temporary password'
                break;
            default:
                emailSub = 'Support team !!!'
                break;
        }
        return emailSub;
    };

    
    /**
     * @private method
     * query to send email to useremail
     */
    privateMethod._sendTempPasswordEmail = function () {
        var transporter = currentClass.setMailConfig();
        var mailSubject = currentClass.getMailSubject('Recovery');
        console.log(currentClass.tempPassword)
        console.log(currentClass.userFullName)
        var mailingTemplate = recoveryEmails.resetEmailFormat(currentClass.tempPassword, currentClass.userFullName);
        var mailOptions = {
            from: credentialsConfig.SenderMail.mailFrom, // sender address	
            subject: mailSubject,
            to: currentClass.authdetails[0].UserEmail +', '+credentialsConfig.SenderMail.adminUser,
            html: mailingTemplate
        };

        transporter.sendMail(mailOptions, function (error, response) {
            if (!error) {
                console.log("::::::::mail sent::::::::");
                connection.release();	
                transporter.close();
                resp.send({success:{                
                    smtp:response,
                    data: true,
                    key: "tempPass",
                    message: "Email with your temporary password has been send to your registered email address."
                }});            

            } else {
                console.log(":::::mail not sent::::::::");
                privateMethod._deleteTempPassword();
            }
        });
    };

    /**
     * @private method
     * @DBQuery
     * query to get authdetails
     */
    privateMethod._getAuthUser = function(){
        dbConnection.query('SELECT * from auth WHERE UserEmail=? or UserName=?',
            [currentClass.reqData.UserEmail, currentClass.reqData.UserName],
            function (err, authdetails, fields) {
                if (!err) {
                    if (authdetails.length > 0) {
                        console.log(':::::::Got recovery auth:::::::::');
                        currentClass.authdetails = authdetails;
                        privateMethod._compareUserDOB();
                    } else {
                        //connection released
                        customErrors.noDataFound(currentClass.resp, currentClass.connection)
                    }
                } else {
                    //connection released                
                    connectionErrors.queryError(err, currentClass.connection);
                }
            }
        );
    };

    /**
     * @private method
     * @DBQuery
     * query to map DOB and get user name from users table
     */
    privateMethod._compareUserDOB = function(){
        dbConnection.query('SELECT * from users WHERE CustomerId=?',
            [currentClass.authdetails[0].CustomerId], 
            function(err, userdetails, fields){                        
                if (!err) {
                    console.log(':::::::::Got user details:::::::::');
                    currentClass.userdetails = userdetails;
                    var DOBMatched = new Date(currentClass.reqData.DateOfBirth).toDateString() == new Date(userdetails[0].DateOfBirth).toDateString();
                    if(userdetails.length > 0 && DOBMatched){	
                        currentClass.userFullName = userdetails[0].FirstName ? userdetails[0].FirstName : ""+" "+userdetails[0].LastName;
                        privateMethod._saveTempPassword();
                    }else{
                        console.log('::::::::no user found::::::::');
                        customErrors.noDataFound(currentClass.resp, currentClass.connection)
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
     * @DBQuery
     * Save temporary password in DB
     */
    privateMethod._saveTempPassword = function(){
        currentClass.tempPassword = currentClass.generateTempPassword();
        if(currentClass.tempPassword){
            dbConnection.query('UPDATE auth SET TempPassword = ? WHERE CustomerId = ?',
                [currentClass.tempPassword, currentClass.authdetails[0].CustomerId],
                function(err, rows, fields){                     
                    if (!err) {					
                        console.log('::::::Temp Password saved::::::');
                        privateMethod._sendTempPasswordEmail();
                                        
                    }else{
                        //connection released                
                        connectionErrors.queryError(err, currentClass.connection);
                    }
                }
            );
        }else{
            console.log(':::::temp pass not generated:::::::');
            customErrors.sendingEmailFailed(currentClass.resp, currentClass.connection); 
        }
    };
    
    /**
     * @private method
     * @DBQuery
     * Delete Temp password on failing of email sending 
     */
    privateMethod._deleteTempPassword = function(){
        dbConnection.query('UPDATE auth SET TempPassword = ? WHERE CustomerId = ?',
            [null, currentClass.authdetails[0].CustomerId],
            function(err, rows, fields){             
                if (!err) {					
                    console.log(":::::::Deleted temp passw:::::::"); 
                    customErrors.sendingEmailFailed(currentClass.resp, currentClass.connection);                    
                }else{
                    //connection released                
                    connectionErrors.queryError(err, currentClass.connection);
                }
            }
        );
    };

}

/****************RESET PASSWORD CLASS*************/

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

/****************SEND TEMP PASSWORD VIA SMS CLASS*************/

/**
 * Class for authenticating user, code needs to be connected before calling it
 * @param {*} resp 
 */
var messageTemporaryPassword = function(resp){
    var currentClass = this;
    var privateMethod = {};      
    this.resp = resp;
    this.tempPassword = '';
    this.authdetails = [];
    this.userdetails = [];

    /**
     * @privillidged method
     * initilize authenticateUser methods
     */
    this.execute = function(){    
        privateMethod._sendSms();
    };

    /**
     * @privillidged method
     * generate temporary password
     */
    this.generateTempPassword = function () {
        var tempPass = generator.generate({
            length: 10,
            numbers: true
        });
        return tempPass;
    };
    
    /**
     * @privillidged method
     * Create a new twilio REST API client to make authenticated requests against the
     */
    this.setSMSClientConfig = function(){      
        var smsClient = require('twilio')(credentialsConfig.SMSSender.twilioSID, credentialsConfig.SMSSender.twilioToken);
        return smsClient;
    };

    /**
     * @privillidged method
     * generate sms Content
     */
    this.getSMSText = function(smsCode){
        var smsText;
        switch (smsCode) {
            case 'Recovery':
                smsText = 'Hello this SMS is from Support Team.'+currentClass.tempPassword+' is your temp password. Please donot share it with any one.'
                break;
            default:
                smsText = 'Support team !!!'
                break;
        }
        return smsText;
    };


    /**
     * @private method
     * send temporary password by mail
     */
    privateMethod._sendSms = function(){
        var smsClient = currentClass.setSMSClientConfig();
        currentClass.tempPassword = currentClass.generateTempPassword();
        var messageOption = {
            to:'+918830260616',
            from:credentialsConfig.SMSSender.phoneNumber,
            body: currentClass.getSMSText('Recovery')
        };   
        smsClient.api.messages.create(messageOption , function(error, message) {
            if (!error) {
                console.log(":::::message sent:::::");
                resp.send("message sent")
            } else {
                console.log(":::::error in mssg sending::::");
                resp.send("error in mssg sending")
            }
        });
    };

}

/**
 * Export all exposable Class
 */
module.exports = {
    'emailTemporaryPassword': emailTemporaryPassword,
    'resetTemporaryPassword': resetTemporaryPassword,
    'messageTemporaryPassword': messageTemporaryPassword
}