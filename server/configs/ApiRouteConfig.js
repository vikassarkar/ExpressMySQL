'use strict';

module.exports = {
  '/login': require('../controllers/auth/AuthenticateController'),
  '/register': require('../controllers/auth/RegistrationController'),
  '/recover': require('../controllers/auth/RecoveryController'),
  '/resetpwd': require('../controllers/auth/ResetPasswordController'),
  '/home': require('../controllers/home/HomeController'),
  '/component':require('../controllers/component/ComponentController')
};