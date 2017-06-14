'use strict';

module.exports = function(app, route) {

    /**
     * Backup API if API doesn't exist at all
	 * @req - request params for api
	 * @resp - response tobe send
     */
    app.delete('/component/:id', function(req, res) {
        res.send(req.params.id + '- Request you are looking for is Not available');
    });

    /**
     * Return middleware.
     */
    return function(req, res, next) {
        next();
    };
}
