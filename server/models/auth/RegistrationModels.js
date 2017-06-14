/**
 * Required and Type model for Registeration api
 */
module.exports = {
    'signupIsRequiredModel': {
        "UserEmail": "required",
        "UserName": "required",
        "UserPassword": "required",
        "LastName": "required",
        "FirstName": "",
        "PhoneNumber": "required",
        "Adress": "",
        "City": "required",
        "PostalCode": "required",
        "Country": "required",
        "AlternatePhoneNumber": "",
        "DateOfBirth": "required"
    },
    'signupTypeModel': {
        "UserEmail": String,
        "UserName": String,
        "UserPassword": String,
        "LastName": String,
        "FirstName": String,
        "PhoneNumber": String,
        "Adress": String,
        "City": String,
        "PostalCode": String,
        "Country": String,
        "AlternatePhoneNumber": String,
        "DateOfBirth": Date
    }
}