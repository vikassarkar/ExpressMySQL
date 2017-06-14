
/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * Base server file to load all API's
 * @envConfig - projects base configuration
 * @app - projects all api routing and base code setup
 * @credentialsConfig - all credentials manager
 */
var envConfig = require('./server/configs/EnvConfig').envConfig,
    app = require('./server/Server')(),
    credentialsConfig = require('./server/configs/CredentialsConfig');

/**
 * Setting port from envConfig port value
 */
app.set('port', (process.env.PORT, envConfig.envport))

/**
 * Opening port lo listion to url API's
 */
app.listen(app.get('port'), function () {
    console.log('::Listining::'+credentialsConfig[envConfig.serverHost]+app.get('port'));
});



