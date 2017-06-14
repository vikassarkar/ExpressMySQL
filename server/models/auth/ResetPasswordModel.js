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