
'use strict';

/**
 * Base server file to load all API's
 * @envConfig - projects base configuration
 * @app - projects all api routing and base code setup
 */
var envConfig = require('./server/configs/EnvConfig').envConfig,
    app = require('./server/Server')();

/**
 * Setting port
 */
app.set('port', (process.env.PORT, envConfig.envport))

/**
 * Opening port lo listion to url API's
 */
app.listen(app.get('port'), function () {
    console.log('::Listining:: http://localhost:'+app.get('port'));
    //console.log('::Listining:: http://ec2-13-126-22-246.ap-south-1.compute.amazonaws.com:'+app.get('port'));
});



