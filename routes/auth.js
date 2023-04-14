const _ = require('lodash');
const User = require('../models/user')
const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const router = express.Router();


router.post('/', [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) {
            return res.status(400).json({ msg: 'Invalid username or password' });
        }
        const token = user.generateAuthToken();
        res.send({ token, username: user.username });

    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: 'Error saving user to database' });
    }
});



//Relogiing user to the database if username and password field matches

module.exports = router;