/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * DB configurations for local and server envirnoments
 * @define all connections variables
 */
var mysql = require('mysql'),
    envConfig = require('./EnvConfig').envConfig,
    credentialsConfig = require('./CredentialsConfig'),
    dbConfig = {
        'EC2PoolConnection':{
            'multipleStatements': true,
            'aquireTimeout':10000,
            'timeout':10000,
            'connectionLimit':50,
            'queueLimit':30,
            'host':credentialsConfig.EC2Pool.host,
            'port':envConfig.dbPort,
            'user':credentialsConfig.EC2Pool.user,
            'password':credentialsConfig.EC2Pool.password,
            'database':credentialsConfig.EC2Pool.database
        },
        'LocalPoolConnection':{
            'multipleStatements': true,
            'connectionLimit':50,
            'queueLimit':30,
            'aquireTimeout':10000,
            'timeout':10000,
            'host':credentialsConfig.LocalPool.host,
            'port':envConfig.dbPort,
            'user':credentialsConfig.LocalPool.user,
            'password':credentialsConfig.LocalPool.password,
            'database':credentialsConfig.LocalPool.database
        }
    };

/**
 * expose dbconnection for curd operations by EXS API's
 */
module.exports = {    
    'dbConnection': mysql.createPool(dbConfig[envConfig.db])
};