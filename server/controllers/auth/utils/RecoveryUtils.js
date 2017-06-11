'use strict';

var recoveryModels = require('../../../models/auth/RecoveryModels'),
    connectionErrors = require('../../../utilities/ConnectionErrors'),
    customErrors = require('../../../utilities/CustomErrors'),
    recoveryEmails = require('../../../views/emailTemplates/ResetPassword'),
    credentialsConfig = require('../../../configs/CredentialsConfig'),  
    generator = require('generate-password'),
    async = require('async'),
    nodemailer = require('nodemailer');


/**
 * generate temporary password
 */
var _generateSecondaryPassword = function () {
    var tempPass = generator.generate({
        length: 10,
        numbers: true
    });
    return tempPass;
}

/**
 * Create a new twilio REST API client to make authenticated requests against the
 */
var _senderMessage = function(){      
	var smsClient = require('twilio')(credentialsConfig.SMSSender.twilioSID, credentialsConfig.SMSSender.twilioToken);
    return smsClient;
}

/**
 * generate sms Content
 */
var _generateSMSText = function(smsCode, tempPass){
    var smsText;
    switch (smsCode) {
        case 'Recovery':
            smsText = 'Hello this SMS is from Support Team.'+tempPass+' is your temp password. Please donot share it with any one.'
            break;
        default:
            smsText = 'Support team !!!'
            break;
    }
    return smsText;
}

/**
 * message content
 */
var _messageContent = function(tempPass){
    var messageOption = {
        to:'+918830260616',
        from:credentialsConfig.SMSSender.phoneNumber,
        body: _generateSMSText('Recovery', tempPass)
    }
    return messageOption;
}

/**
 * 
 */
var _sendSms = function(resp){
    var TempPassword = _generateSecondaryPassword();
    var messageOption = _messageContent(TempPassword);
    var smsClient = _senderMessage();   

    smsClient.api.messages.create(messageOption , function(error, message) {
        if (!error) {
            console.log(message);
            resp.send("message sent")
        } else {
            console.log(error);
            resp.send("error in mssg sending")
        }
    });
}

/**
 * configure sender mail
 */
var _senderMail = function () {
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
}

/**
 * generate subject of mail
 */
var _generateMailSubject = function (mailCode) {
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
}

/**
 * generate email template
 */
var _generateMailTemplate = function (secondaryPassword, userFullName) {
    console.log(userFullName)
    var template =  recoveryEmails.resetEmailFormat(secondaryPassword, userFullName)
    return template;
}

/**
 * setup mail content to be send 
 */
var _mailContent = function (subject, mailingAddress, html) {
    var mailOptions = {
        from: credentialsConfig.SenderMail.mailFrom, // sender address	
        subject: subject,
        to: mailingAddress+', '+credentialsConfig.SenderMail.adminUser,
        html: html
    };
    return mailOptions;
}

/**
 * query to map DOB and get user name from users table
 */
var _confirmUserForEmail = function(dbConnection, userEmail, customerId, reqData, resp, connection){
    dbConnection.query('SELECT * from users WHERE CustomerId=?',
        [customerId], 
        function(err, userDetails, fields){                        
            if (!err) {
                console.log(':::::::::::::In users finding user:::::::::::::');
                var DOBMatched = new Date(reqData.DateOfBirth).toDateString() == new Date(userDetails[0].DateOfBirth).toDateString();
                console.log('::::::::Date of Birth Mached:::::::-'+DOBMatched);
                if(userDetails.length > 0 && DOBMatched){						
                    console.log(':::::::::::::Got recovery user:::::::::::::');
                    var userFullName = userDetails[0].FirstName ? userDetails[0].FirstName : ""+" "+userDetails[0].LastName;
                    _saveTempPassword(dbConnection, userEmail, customerId, userFullName, resp, connection);
                }else{
                    console.log(':::::::::::::no user found:::::::::::::');
                    customErrors.noDataFound(resp, connection)
                }                    
            }else{
                console.log(':::::::::::::Cannot get user:::::::::::::');
                //connection released                
                connectionErrors.queryError(err, connection);
            }
        }
    );						
}

/**
 * Save temporary password in DB
 */
var _saveTempPassword = function(dbConnection, userEmail, customerId, userFullName, resp, connection){
    var secondaryPassword = _generateSecondaryPassword();
    if(secondaryPassword){
        console.log(secondaryPassword)
        dbConnection.query('UPDATE auth SET TempPassword = ? WHERE CustomerId = ?',
            [secondaryPassword, customerId],
            function(err, rows, fields){            
                console.log(':::::::::::::in saving Temp Password:::::::::::::');            
                if (!err) {					
                    console.log(':::::::::::::Temp Password saved:::::::::::::');
                    _sendTemporaryPasswordEmail(dbConnection, customerId, secondaryPassword, userEmail, userFullName, resp, connection);
                                    
                }else{
                    console.log(':::::::::::::Cannot save Temp Password:::::::::::::'); 
                    //connection released                
                    connectionErrors.queryError(err, connection);
                }
            }
        );
    }else{
        console.log('::::::::::SEC pass not generated::::::::::::::::');
        customErrors.sendingEmailFailed(resp, connection); 
    }
}

/**
 * Gather all data and send email
 */
var _sendTemporaryPasswordEmail = function (dbConnection, customerId, secondaryPassword, userEmail, userFullName, resp, connection) {
    var transporter = _senderMail();
    var mailSubject = _generateMailSubject('Recovery');
    var mailingAddress = userEmail;
    var mailingTemplate = _generateMailTemplate(secondaryPassword, userFullName);
    var mailOptions = _mailContent(mailSubject, mailingAddress, mailingTemplate);
    transporter.sendMail(mailOptions, function (error, response) {
        console.log(":::::::::::::::::In sending mail::::::::::::::::::::")
        if (!error) {
            console.log("::::::::::::mail sent releasing connection:::::::::::::");
            connection.release();	
            transporter.close();
            resp.send({success:{                
                smtp:response,
                data: true,
                key: "tempPass",
                message: "Email with your temporary password has been send to your registered email address."
            }});            

        } else {
            console.log(":::::::::::::mail not sent deleting temp pass::::::::::::::::");
            _deleteTempPasswordOnEmailFail(dbConnection, customerId, resp, connection);
        }
    });
}

/**
 * Delete Temp password on failing of email sending 
 */
var _deleteTempPasswordOnEmailFail = function(dbConnection, customerId, resp, connection){
    dbConnection.query('UPDATE auth SET TempPassword = ? WHERE CustomerId = ?',
        [null, customerId],
        function(err, rows, fields){  
            console.log(":::::::::::::::::In Deleting temp passw::::::::::::::::::::");            
            if (!err) {					
                console.log(":::::::::::::::::Deleted temp passw::::::::::::::::::::"); 
                customErrors.sendingEmailFailed(resp, connection);                    
            }else{
                console.log(":::::::::::::::::Deleting temp passw failed::::::::::::::::::::");
                //connection released                
                connectionErrors.queryError(err, connection);
            }
        }
    );
}
module.exports = {
    'generateSecondaryPassword': _generateSecondaryPassword,
    'confirmUserForEmail': _confirmUserForEmail,
    'sendSms':_sendSms
}