/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * handle error while connection fails
 * @param {*} err 
 * @param {*} connection 
 */
var _connectionError = function(err, connection){
    console.log(':::::::::Error in mysql pool connection:::::::::::');
    connection.release();
    resp.status(err.status)
    resp.send({ 
        error: {
            status: err.status,                
            message: "Cannot connect to DB",
            description: "Something went wrong to connect DB"
        }
    });
}

/**
 * handle query failing error
 * @param {*} err 
 * @param {*} connection 
 */
var _queryError = function(err, connection){
    console.log('::::::::::::::::::Error in query::::::::::::::::::');
    if(connection){
        connection.release();
    }
    resp.status(err.status)
    resp.send({ 
        error: {
            status: err.status,                
            message: "Query cannot be executed",
            description: "Something went wrong to with query to retrive or save data"
        }
    });
}

/**
 * Export Exposable methods only
 */
module.exports = {
    'connectionError': _connectionError,
    'queryError': _queryError
}