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
const allowedOrigins = [
    'http://localhost:3000', // Replace 3000 with the port you are using for your React app during development
    'https://africanachildphotography.com' // Replace with the URL of your deployed React app
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token']
}));



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