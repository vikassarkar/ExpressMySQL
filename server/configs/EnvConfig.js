module.exports.envConfig = {
    'db':'LocalPoolConnection',//EC2PoolConnection
    'dbPort':'3306',
    'envport': '8080', //8080
    'env':'development', //'production'
    'hashSaltRounds':10,
    'serverHost':'localhost'//AWS
};