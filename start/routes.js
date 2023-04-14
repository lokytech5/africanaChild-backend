const express = require('express');

const User = require('../routes/users');
const auth = require('../routes/auth')
const image = require('../routes/images')
const services = require('../routes/serviceRequests');

module.exports = function (app) {
    //*calling each route here
    app.use('/api/users', User);
    app.use('/api/auth', auth);
    app.use('/api/images', image);
    app.use('/api/services', services);
}