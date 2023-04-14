const config = require('config');

module.exports = function () {

    //*Checking if private Key is not define in the entire application
    if (!config.get('jwtPrivateKey')) {
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
    }
}