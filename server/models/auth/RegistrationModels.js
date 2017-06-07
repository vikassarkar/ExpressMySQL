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
        "UserEmail": "string",
        "UserName": "string",
        "UserPassword": "string",
        "LastName": "string",
        "FirstName": "string",
        "PhoneNumber": "string",
        "Adress": "string",
        "City": "string",
        "PostalCode": "string",
        "Country": "string",
        "AlternatePhoneNumber": "string",
        "DateOfBirth": "date"
    }
}