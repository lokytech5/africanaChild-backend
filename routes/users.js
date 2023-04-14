require('dotenv').config();
const _ = require('lodash');
const User = require('../models/user')
const auth = require('../middleware/auth')
const ServiceRequest = require('../models/serviceRequest')
const admin = require('../middleware/admin')
const { sendRegistrationEmail } = require('../mails/email')
const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const router = express.Router();


//* Getting current login users
//* Require Admin priviledge. must login as ADMIN
// router.get('/:id', [auth, admin], async (req, res) => {
//     const user = await User.findById(req.user._id).select('-password')
//     if (!user.isAdmin) {
//         return res.status(403).send('Access Denied not an Administrator');
//     }
//     res.send(user);
// });

//*Getting List of Users
router.get('/', async (req, res) => {
    const user = await User.find();
    res.status(200).send({ user });
});

//* Deleting a user's record
//* Require Admin priviledge. must login as ADMIN
router.delete('/admin/:id', [auth, admin], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        await User.findByIdAndRemove(req.params.id);
        res.send({ message: 'Successfully deleted user' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//* Registration
router.post('/', [
    check('username', 'Username must be at least 5 characters long').isLength({ min: 5 }),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 5 characters long').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const checkUser = await User.findOne({ email: req.body.email });
        if (checkUser) {
            return res.status(400).json({ msg: 'user already exists' });
        }

        //using loadash to shorthern the code.
        const user = new User(_.pick(req.body, ['username', 'email', 'password']));
        //Encrpting the user password with bcrpyt a hashing password module in node
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        const savedUser = await user.save();
        const token = user.generateAuthToken();
        res.status(201).header('x-auth-token', token).send(_.pick(savedUser, ['_id', 'username', 'email']));
        await sendRegistrationEmail(user);
    } catch (error) {
        console.error('Error in registration:', error.message);
        res.status(500).send({ error: 'Error saving user to database' });
    }
});

//*The following route below are for users booking and Profile Management by ID

//*Getting users Bookings by ID
router.get('/booking/:userId', auth, async (req, res) => {
    try {
        const userBooking = await ServiceRequest.find({ userId: req.params.userId });
        res.status(200).send(userBooking)
    } catch (error) {
        console.error('Error fetching user booking data:', error);
        res.status(500).json({ error: error.message });
    }
});

//*Updating Users Booking by ID
router.put('/booking/:id', auth, async (req, res) => {
    try {
        const userBooking = await ServiceRequest.findById(req.params.id);
        if (!userBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Update only the fields provided in the request body
        const fieldsToUpdate = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (value) {
                fieldsToUpdate[key] = value;
            }
        }

        const updatedBooking = await ServiceRequest.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Successfully updated your booking record', updatedBooking });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ errors: [{ msg: "Invalid Booking ID" }] });
        }
        res.status(500).json({ error: error.message });
    }
});

//*Delete or Cancel Users Booking by ID
router.delete('/booking/:id', auth, async (req, res) => {
    try {
        const userBooking = await ServiceRequest.findByIdAndRemove(req.params.id);
        if (!userBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.status(200).json({ message: 'Booking successfully deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//*Fetching Users Information for profile management
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.send({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//*Updating Users Information
router.put('/me', [
    check('username', 'Username must be at least 5 characters long').isLength({ min: 5 }),
    check('email', 'Please include a valid email').isEmail(),
], auth, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Update user information
        const fieldsToUpdate = {
            username: req.body.username,
            email: req.body.email,
        }

        const updatedUser = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });

        res.send(_.pick(updatedUser, ['_id', 'username', 'email']));

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

module.exports = router;