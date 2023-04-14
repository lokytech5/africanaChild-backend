const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

module.exports = function () {
    //* Connecting to MongoDB database
    const db = process.env.MONGO_URI;
    mongoose.set('strictQuery', true);
    return mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log(`Connected to ${db}`))
}