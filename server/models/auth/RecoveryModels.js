/**
 * Required and Type model for Recovery api
 */
module.exports = {
    'recoveryIsRequiredModel': {
        "UserEmail": "required_1",
        "UserName": "required_1",
        "DateOfBirth": "required"
    },
    'recoveryTypeModel': {
        "UserEmail": String,
        "UserName": String,
        "DateOfBirth": Date
    }
}