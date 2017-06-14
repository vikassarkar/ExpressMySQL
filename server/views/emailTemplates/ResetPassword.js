
'use strict';

/**
 * Email template for recovery password
 * @param {*} temporaryPassword 
 * @param {*} userFullName 
 */
var _resetEmailFormat = function (temporaryPassword, userFullName) {
    var resetEmailTemplate = '   <body style="font-family:Arial, Helvetica, sans-serif; margin:0; padding:0; background-color:#ffffff">  ' +
        '     <center style="border:1px solid #cccccc;">  ' +
        '       <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapper">  ' +
        '         <tbody>  ' +
        '           <tr>  ' +
        '             <td align="center" height="100%" valign="top" width="100%">  ' +
        '               <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff">  ' +
        '                 <tbody>  ' +
        '                   <tr>  ' +
        '                     <td align="center" valign="top" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#525252;">  ' +
        '                       <div style="font-size:18px; color:#ffffff; background-color:#0d47a1; height:4rem; line-height:4rem">  ' +
        '                         <font>  ' +
        '                           <font>Team support</font>  ' +
        '                         </font>  ' +
        '                       </div>  ' +
        '                     </td>  ' +
        '                   </tr>  ' +
        '                 </tbody>  ' +
        '               </table>  ' +
        '             </td>  ' +
        '           </tr>  ' +
        '           <tr>  ' +
        '           </tr>  ' +
        '         </tbody>  ' +
        '       </table>  ' +
        '       <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;" bgcolor="#ffffff">  ' +
        '         <tbody>  ' +
        '           <tr>  ' +
        '             <td valign="top" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#525252;">  ' +
        '               <div style="font-size:15px;color:#525252;background-color:#ffffff;padding: 25px 30px 0px;font-style:italic;">  ' +
        '                 <h3>Hi ' + userFullName + ', </h3>  ' +
        '               </div>  ' +
        '             </td>  ' +
        '           </tr>  ' +
        '         </tbody>  ' +
        '       </table>  ' +
        '       <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;" bgcolor="#ffffff">  ' +
        '         <tbody>  ' +
        '           <tr>  ' +
        '             <td align="center" valign="top" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#525252;">  ' +
        '               <div style="font-size:15px;color:#525252;background-color:#ffffff;min-height: 130px;line-height: 30px;padding: 20px;font-style:italic;">  ' +
        '                 <font>You recently requested to reset your password from your account. Your Temporary password to reset your current  ' +
        '                   password is provided below. If you didnot requested for Password reset, please reply to this mail, To our  ' +
        '                   Support team or contact our customer care reprentative.  ' +
        '                 </font>  ' +
        '               </div>  ' +
        '             </td>  ' +
        '           </tr>  ' +
        '         </tbody>  ' +
        '       </table>  ' +
        '       <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;" bgcolor="#FFFFFF">  ' +
        '         <tbody>  ' +
        '           <tr>  ' +
        '             <td align="center" valign="top" style="font-size:0;">  ' +
        '               <div style="vertical-align:top;display: inline-block;align-self: center;width:100%;margin-bottom: 10px;background-color: #0d47a1;align-items: center;max-width: 500px;">  ' +
        '                 <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 250px;" class="deviceWidth">  ' +
        '                   <tbody>  ' +
        '                     <tr>  ' +
        '                       <td align="center" valign="top" style="font-size: 16px;width:100%;color: #ffffff;padding: 30px 10px;font-style:italic;">  ' +
        '                         Your Temporary password is - </td>  ' +
        '                     </tr>  ' +
        '                   </tbody>  ' +
        '                 </table>  ' +
        '                 <table align="right" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 250px;" class="deviceWidth">  ' +
        '                   <tbody>  ' +
        '                     <tr>  ' +
        '                       <td align="center" valign="top" style="font-size: 20px;width:100%;color: #ffffff;padding: 28px 10px;">  ' + temporaryPassword +
        '                       </td>  ' +
        '                     </tr>  ' +
        '                   </tbody>  ' +
        '                 </table>  ' +
        '               </div>  ' +
        '               <div style="display:inline-block; max-width:295px; vertical-align:top; width:100%;">  ' +
        '                 <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:295px;" class="deviceWidth">  ' +
        '                   <tbody>  ' +
        '                     <tr>  ' +
        '                       <td align="center" valign="top" style="font-size:14px;color:#525252;padding: 1.5rem;font-style:italic;">  ' +
        '                         Please donot share your temporary password with any one.  ' +
        '                       </td>  ' +
        '                     </tr>  ' +
        '                   </tbody>  ' +
        '                 </table>  ' +
        '               </div>  ' +
        '             </td>  ' +
        '           </tr>  ' +
        '         </tbody>  ' +
        '       </table>  ' +
        '       <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#FFFFFF">  ' +
        '         <tbody>  ' +
        '           <tr>  ' +
        '             <td align="center" valign="top" style="font-size:0;height: 130px;background-color: #0d47a1;color: #fff;">  ' +
        '               <div style="display:inline-block;max-width: 600px;vertical-align:top;width:100%;">  ' +
        '                 <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="  ' +
        '                   width: 100%; max-width: 600px;" class="deviceWidth">  ' +
        '                   <tbody>  ' +
        '                     <tr>  ' +
        '                       <td align="center" valign="top" style="font-size: 11px;color: #ffffff;padding: 1.5rem 1.5rem 0;max-width: 600px;font-style:italic;width: 100%;">Ⓒ Copyright all rights are reserved. </td>  ' +
        '                     </tr>  ' +
        '                     <tr>  ' +
        '                       <td align="center" valign="top" style="font-size: 11px;color: #ffffff;padding: 1.5rem;max-width: 600px;font-style:italic;width: 100%;">  ' +
        '                         Need Assistance? Just write to us at donotreplyme2017@gmail.com for any query you may have. Alternatively, reach us at +91 9312329999  ' +
        '                         or Chat with us on our website between 9:00am and 9:00pm.  ' +
        '                       </td>  ' +
        '                     </tr>  ' +
        '                   </tbody>  ' +
        '                 </table>  ' +
        '               </div>  ' +
        '               <div style="display:inline-block;max-width:195px;vertical-align:top;width:100%;bottom: 0;">  ' +
        '                 <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:195px;" class="deviceWidth">  ' +
        '                   <tbody>  ' +
        '                     <tr>  ' +
        '                       <td align="center" valign="top" style="font-size: 11px;color: #ffffff;">  ' +
        '                         Google+  ' +
        '                       </td>  ' +
        '                     </tr>  ' +
        '                   </tbody>  ' +
        '                 </table>  ' +
        '               </div>  ' +
        '               <div style="display:inline-block; max-width:195px; vertical-align:top; width:100%;">  ' +
        '                 <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:195px;" class="deviceWidth">  ' +
        '                   <tbody>  ' +
        '                     <tr>  ' +
        '                       <td align="center" valign="top" style="font-size: 11px;color: #ffffff;">  ' +
        '                         LinkedIn  ' +
        '                       </td>  ' +
        '                     </tr>  ' +
        '                   </tbody>  ' +
        '                 </table>  ' +
        '               </div>  ' +
        '               <div style="display:inline-block; max-width:195px; vertical-align:top; width:100%;">  ' +
        '                 <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:195px;" class="deviceWidth">  ' +
        '                   <tbody>  ' +
        '                     <tr>  ' +
        '                       <td align="center" valign="top" style="font-size: 11px;color: #ffffff;">  ' +
        '                         Facebook  ' +
        '                       </td>  ' +
        '                     </tr>  ' +
        '                   </tbody>  ' +
        '                 </table>  ' +
        '               </div>  ' +
        '             </td>  ' +
        '           </tr>  ' +
        '         </tbody>  ' +
        '       </table>  ' +
        '     </center>  ' +
        '  </body>  ';
    return resetEmailTemplate;
}

/**
 * Export Exposable methods
 */
module.exports = {
    'resetEmailFormat': _resetEmailFormat
}