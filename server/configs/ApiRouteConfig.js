/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * api controllers router file
 * @define all routing configurations here
 */
module.exports = {
  '/login': require('../controllers/auth/AuthenticateController'),
  '/register': require('../controllers/auth/RegistrationController'),
  '/recover': require('../controllers/auth/RecoveryController'),
  '/resetpwd': require('../controllers/auth/ResetPasswordController'),
  '/home': require('../controllers/home/HomeController'),
  '/component':require('../controllers/component/ComponentController')
};