require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });
require('express-async-errors');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('config');
const app = express();


//*Initalizing body parser here
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(express.json());


//*using Cors
app.use(cors());


require('./start/routes')(app);
require('./start/db')();
require('./start/config')();



app.use(express.static('public'));


// const port = process.env.PORT || 5000;
// const server = app.listen(port, function () {
//     console.log(`Listening on port ${port}`);
// })

const port = config.get('port') || 5000;
let server;
if (process.env.NODE_ENV !== "test") {
    server = app.listen(port, function () {
        console.log(`Listening on port ${port}`);
    });
}

module.exports = { app, server };