/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * Required and Type model for Reset api
 */
module.exports = {
    'resetIsRequiredModel': {
        "UserEmail": "required_1",
        "UserName": "required_1",
        "TempPassword": "required",
        "NewPassword": "required"
    },
    'resetTypeModel': {
        "UserEmail": String,
        "UserName": String,
        "TempPassword": String,
        "NewPassword": String
    }
}