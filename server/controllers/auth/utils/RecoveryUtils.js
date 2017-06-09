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
var _confirmUserForEmail = function(dbConnection, userEmail, customerId, resp, connection){
    dbConnection.query('SELECT * from users WHERE CustomerId=?',
        [customerId], 
        function(err, userDetails, fields){                        
            if (!err) {
                console.log(':::::::::::::In users finding user:::::::::::::');
                if(userDetails.length > 0){						
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
    'confirmUserForEmail': _confirmUserForEmail
}