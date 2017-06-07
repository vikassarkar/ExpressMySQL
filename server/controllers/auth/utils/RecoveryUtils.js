'use strict';

var recoveryModels = require('../../../models/auth/RecoveryModels'),
    connectionErrors = require('../../../utilities/ConnectionErrors'),
	customErrors = require('../../../utilities/CustomErrors'),
    credentialsConfig = require('../../../configs/CredentialsConfig'),
	generator = require('generate-password'),
    async = require('async'),
	nodemailer = require('nodemailer');


/**
 * generate temporary password
 */
var _generateSecondaryPassword = function(){
    var tempPass = generator.generate({
                        length: 10,
                        numbers: true
                    });
    return tempPass;
}

/**
 * configure sender mail
 */
var _senderMail = function(){
    var transporter = nodemailer.createTransport({
        host: credentialsConfig.SenderMail.host,
        port: 465,
        secure: true, // secure:true for port 465, secure:false for port 587
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
var _generateMailSubject = function(mailCode){
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
var _generateMailTemplate = function(secondaryPassword){
    var template = '<table bgcolor="#E6E6E6" width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width:332px;max-width:600px;border:1px solid #e0e0e0;border-bottom:0;border-top-left-radius:3px;border-top-right-radius:3px"><tbody><tr><td height="72px" colspan="3"></td></tr><tr><td width="32px"></td><td style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;font-size:24px;color:#000000;line-height:1.25">Access for less secure apps has been turned on</td><td width="32px"></td></tr><tr><td height="18px" colspan="3">'+secondaryPassword+'</td></tr></tbody></table>'

    return template;
}

/**
 * setup mail content to be send 
 */
var _mailContent = function(subject, mailingAddress, html){
    var mailOptions = {
        from: credentialsConfig.SenderMail.mailFrom, // sender address	
        subject: subject,
        to: mailingAddress,
        html: html
    };
    return mailOptions;
}

/**
 * Gather all data and send email
 */
var _sendTemporaryPasswordEmail = function(userEmail, resp, connection){
    var transporter = _senderMail();
    var secondaryPassword = _generateSecondaryPassword();
    var mailSubject = _generateMailSubject('Recovery');
    var mailingAddress = userEmail;
    var mailingTemplate = _generateMailTemplate(secondaryPassword);
    var mailOptions = _mailContent(mailSubject, mailingAddress, mailingTemplate);
    console.log(JSON.stringify(mailOptions));
    transporter.sendMail(mailOptions, function(error, info){
        if (!error) {
            resp.send({success:{
                data:true,
                key:'tempPass',
                message:"Email with your temporary password has been send to your registered email address."
            }});
        }else{
            console.log(error);
            resp.send("unable to send mail.")
        }									
    });	
}
module.exports = {    
    'generateSecondaryPassword' : _generateSecondaryPassword,
    'sendTemporaryPasswordEmail': _sendTemporaryPasswordEmail
}