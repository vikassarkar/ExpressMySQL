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
 */
var recoveryModels = require('../../../models/auth/RecoveryModels'),
    connectionErrors = require('../../../utilities/ConnectionErrors'),
    customErrors = require('../../../utilities/CustomErrors'),
    recoveryEmails = require('../../../views/emailTemplates/ResetPassword'),
    credentialsConfig = require('../../../configs/CredentialsConfig'),  
    generator = require('generate-password'),
    nodemailer = require('nodemailer');

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
        var tempPassword = currentClass.generateTempPassword();
        if(tempPassword){
            dbConnection.query('UPDATE auth SET TempPassword = ? WHERE CustomerId = ?',
                [tempPassword, currentClass.authdetails[0].CustomerId],
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
    'messageTemporaryPassword': messageTemporaryPassword
}