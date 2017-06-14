var port = process.env.PORT ||'8010';

module.exports.envConfig = {
    'db':'LocalPoolConnection',//EC2PoolConnection
    'dbPort':'3306',
    'envport': port,
    'env':'development', //'production'
    'hashSaltRounds':10,
    'serverHost':'localhost'//, heroku, AWS
};