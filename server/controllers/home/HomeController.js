/**
 * Created by - vikas
 * date - 2107-06-15
 */

'use strict';

/**
 * @connectionErrors - to handle DB connection error
 */
var connectionErrors = require('../../utilities/ConnectionErrors');

module.exports = function(app, route, dbConnection) {

	/**
	 * test api to check if URL for API's are working
	 * @req - request params for api
	 * @resp - response tobe send
	 */
	app.get('/home/init', function (req, resp) {
		resp.send('<h1 style="color:green">Node hosted sucessfully</h1><p>you can now jump to API.</p>');
	});

	/**
	 * get all users in data
	 * @req - request params for api
	 * @resp - response tobe send
	 */
	app.get('/home/getAllUsers', function (req, resp) {
		dbConnection.getConnection(function (err, connection) {
			console.log('::::::::::::in mysql pool connection::::::::::::::::::');
			if (err) {
				connectionErrors.connectionError(err, connection);
			}
			dbConnection.query('SELECT * from users', function (err, rows) {
				connection.release();
				if (!err) {
					console.log('::::::::::::::::::Got data::::::::::::::::::::');
					resp.json(rows);
				}else{                
					connectionErrors.queryError(err, connection);
				}
			});
		});
	});

	/**
	 * get users row based on req query
	 * @req - request params for api
	 * @resp - response tobe send
	 * @req param {* ||} FirstName 
 	 * @req param {* ||} LastName 
 	 * @req param {* ||} UserEmail  ///// code to be updated
	 */
	app.post('/home/getSpecificUser', function(req, resp) {
		dbConnection.getConnection(function (err, connection) {
			console.log('::::::::::::::::::in mysql pool connection::::::::::::::::::');
			if (err) {
				connectionErrors.connectionError(err, connection);
			}			
			var reqData = req.body;
			dbConnection.query('SELECT * from users WHERE FirstName=? || LastName=?',
			[reqData.FirstName, reqData.LastName], 
				function(err, rows, fields){
					connection.release();
					if (!err) {
						console.log('::::::::::::::::::Got data::::::::::::::::::');
						resp.json(rows);
					}else{                
						connectionErrors.queryError(err, connection);
					}
				});
		});
	});

	/**
     * Backup API if API doesn't exist at all
	 * @req - request params for api
	 * @resp - response tobe send
     */
	app.get('/home/:id', function(req, res) {
		res.send(req.params.id + '- Request you are looking for is Not available');
	});

	/**
	 * Return middleware.
	 */
	return function(req, res, next) {
		next();
	};
}
