'use strict';

module.exports = function(app, route) {

    app.get('/component', function(req, res) {
        resp.send('<h1 style="color:green">get/component/</h1>')
    });

    app.post('/component', function(req, res) {
        resp.send('<h1 style="color:green">post/component/</h1>')
    });

    app.delete('/component/:id', function(req, res) {
        resp.send('<h1 style="color:green">delete/component/'+req.params.id+'/</h1>')
    });

    /*
     **Return middleware.
     */
    return function(req, res, next) {
        next();
    };
}
