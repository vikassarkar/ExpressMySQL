'use strict';

var connectionErrors = require('../../utilities/ConnectionErrors');

module.exports = function(app, route, dbConnection) {

	/**
	 * test api to check if URL for API's are working
	 */
	app.get('/home/init', function (req, resp) {
		resp.send('<h1 style="color:green">Node hosted sucessfully</h1><p>you can now jump to API.</p>');
	});

	/**
	 * get all users in data
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
	 * @FirstName: first name of user
	 */
	app.post('/home/getSpecificUser', function(req, resp) {
		dbConnection.getConnection(function (err, connection) {
			console.log('::::::::::::::::::in mysql pool connection::::::::::::::::::');
			if (err) {
				connectionErrors.connectionError(err, connection);
			}			
			var reqData = req.body;
			dbConnection.query('SELECT * from users WHERE FirstName=?',
			[reqData.FirstName], 
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
     */
	app.get('/home/:id', function(req, res) {
		res.send('respond with a home data with id - '+ req.params.id);
	});

	/*
	**Return middleware.
	*/
	return function(req, res, next) {
		next();
	};
}
