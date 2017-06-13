/**
 * handle error when model of request mismatches with recived request
 */
var _modelMismatch = function(resp, connection){
    console.log('::::::::::::Error Bad request or Request mismatch::::::::::::');
    if(connection){
        connection.release();
    }
    resp.status(400)
    resp.send({ 
        error: {
            status: "400",                
            message: "Bad request or Request mismatch",
            description: "Any of request key and value pair is a required not passed"
        } 
    });
}

/**
 * handle error if user already exist in DB
 */
var _userExist = function(resp, connection){
    console.log('::::::::::Error user already exist::::::::::');
        if(connection){
        connection.release();
    }
    resp.status(409)
    resp.send({ 
        error: {
            status: "409",                
            message: "User already exist",
            description: "The request could not be completed due to a conflict with the current state of the target resource"
        }
    });
}

/**
 * Handle error if saving data in any of DB fails
 */
var _cannotSaveUser = function(resp, connection){
    console.log('::::::::::::::Error Internal Server Error::::::::::::::');
        if(connection){
        connection.release();
    }
    resp.status(500)
    resp.send({ 
        error: {
            status: "500",                
            message: "Internal Server Error",
            description: "DB table row mismatch. The server has encountered a situation it doesn't know how to handle"
        }
    });
}

/**
 * Handle error if username/useremail and password mismatches
 */
var _usernamePasswordMismatch = function(resp, connection){
    console.log('::::::::::Error multiple users for this login::::::::::');
    if(connection){
        connection.release();
    }
    resp.status(401)
    resp.send({ 
        error: {
            status: "401",                
            message: "Unaurthorized login",
            description: "User email or username and password combination is mismatching in resources, Please try again."
        }
    });
}

/**
 *Handle error if multiple user details exist whie logging in
 */
var _multipleUsers = function(resp, connection){
    console.log('::::::::::Error multiple users for this login::::::::::');
    if(connection){
        connection.release();
    }
    resp.status(409)
    resp.send({ 
        error: {
            status: "409",                
            message: "Multiple users for this login",
            description: "The request could not be completed due to a multiple user for current resources. contact your administrator."
        }
    });
}

/**
 * Handle no data error condition 
 */
var _noDataFound = function(resp, connection){
    console.log('::::::::::Error no related data found::::::::::');
    if(connection){
        connection.release();
    }
    resp.status(444)
    resp.send({ 
        error: {
            status: "444",                
            message: "No data found",
            description: "The request could not be completed as no data related to your request was found."
        }
    });
}

/**
 * email sending failed to user
 */
var _sendingEmailFailed = function(resp, connection){
    console.log('::::::::::Error email not send::::::::::');
    if(connection){
        connection.release();
    }
    resp.status(550)
    resp.send({ 
        error: {
            status: "550",                
            message: "SMTP error",
            description: "Unable to send email to defined email id."
        }
    });
}

/**
 * handle error while user trying to reset password to 3 of its old password
 */
var _NewPasswordMatchedOld = function(resp, connection){
    console.log(':::::::Error Password cannot be previous 3::::::::');
    if(connection){
        connection.release();
    }
    resp.status(404)
    resp.send({ 
        error: {
            status: "404",                
            message: "cannot be old password",
            description: "New password cannot be same as old 3 passwords"
        }
    });
}
module.exports = {
    'modelMismatch': _modelMismatch,
    'userExist': _userExist,
    'cannotSaveUser': _cannotSaveUser,
    'usernamePasswordMismatch':_usernamePasswordMismatch,
    'multipleUsers':_multipleUsers,
    'noDataFound': _noDataFound,
    'sendingEmailFailed': _sendingEmailFailed,
    'NewPasswordMatchedOld':_NewPasswordMatchedOld
}