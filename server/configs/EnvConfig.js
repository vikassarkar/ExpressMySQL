/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * set dynamic port ie tobe used in server heroku doesn't use forced port's 
 */
var port = process.env.PORT ||'8010';

/**
 * API configurations for local and server envirnoments
 */
module.exports.envConfig = {
    'db':'LocalPoolConnection',//EC2PoolConnection
    'dbPort':'3306',
    'envport': port,
    'env':'development', //'production'
    'hashSaltRounds':10,
    'serverHost':'localhost'//, heroku, AWS
};