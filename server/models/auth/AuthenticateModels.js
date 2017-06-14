/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * Required and Type model for Login authentication api
 */
module.exports = {
    'signinIsRequiredModel': {
        "UserEmail": "required_1",
        "UserName": "required_1",
        "UserPassword": "required"
    },
    'signinTypeModel': {
        "UserEmail": String,
        "UserName": String,
        "UserPassword": String
    }
}