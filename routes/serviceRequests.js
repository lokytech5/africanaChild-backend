require('dotenv').config();
const { check, validationResult } = require('express-validator');
const moment = require('moment');
const auth = require('../middleware/auth')
const { sendEmailNotification } = require('../mails/email')
const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/serviceRequest');
const admin = require('../middleware/admin');


//* Getting all the list of service from the server routes
router.get('/', async (req, res) => {
    const serviceRequest = await ServiceRequest.find();
    res.status(200).send({ serviceRequest });
});

//*Saving servicesRequested from customers to database
//* Must be a registered User
router.post('/', [
    check('name').exists().withMessage('Name is required'),
    check('email').exists().isEmail().withMessage('Email is required'),
    check('phoneNumber').exists().withMessage('Phone number is required'),
    check('serviceType').exists().withMessage('Service type is required'),
    check('date')
        .exists().withMessage('Date is required')
        .custom((value, { req }) => {
            if (!moment(value, 'YYYY-MM-DD', true).isValid()) {
                throw new Error('Invalid date format');
            }
            return true;
        }),
    check('time').exists().withMessage('Time is required'),
    check('address').exists().withMessage('Address is required'),
], auth, async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const serviceRequest = new ServiceRequest({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        serviceType: req.body.serviceType,
        date: req.body.date,
        time: req.body.time,
        address: req.body.address,
        message: req.body.message,
        userId: req.user._id,
        status: 'pending',
    });

    try {
        await serviceRequest.save();

        //*Send email notifications to the user, admin and owner
        const rescipients = [
            req.body.email,       //* users of the application email
            process.env.PHOTOGRAPHY_SERVICE_ADMIN_EMAIL_ADDRESS, //* admin email address
            process.env.PHOTOGRAPHY_SERVICE_OWNER_EMAIL_ADDRESS,  //* owner email address
        ];
        await sendEmailNotification(rescipients, serviceRequest.toObject());
        res.send('Successfully added new serviceRequest');
    } catch (error) {
        res.status(500).send(error.message);
    }

});


//* Deleting a single customer service request from the database
//* Require Admin priviledge. must login as ADMIN
router.delete('/admin/:id', [
    check('id').exists().withMessage('Service id is required').isMongoId().withMessage('Service id must be a valid MongoId').trim().escape(),
], [auth, admin], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const serviceRequest = await ServiceRequest.findById(req.params.id);
        if (!serviceRequest) {
            return res.status(404).json({ error: "Customer Service not found" });
        }
        await ServiceRequest.findByIdAndRemove(req.params.id);
        res.status(200).send({ message: 'Successfully Deleted Customer with the particular id' })

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//*Getting a single record from service in mongodb
//* Require Admin priviledge. must login as ADMIN
router.get('/:id', [
    check('id').exists().withMessage('Cutomer Service ID is required').isMongoId().withMessage('Invalid Customer Service ID')
], [auth, admin], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const serviceRequest = await ServiceRequest.findById(req.params.id);
        if (!serviceRequest) {
            return res.status(404).json({ error: "Customer Service not found" });
        }
        res.status(200).json(serviceRequest);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


//*Updating and deleting status in service request database
//* Require Admin priviledge. must login as ADMIN
router.put('/admin/:id', [
    check('id').exists().withMessage('Customer Service ID is required')
], [auth, admin], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const serviceRequest = await ServiceRequest.findById(req.params.id);
        if (!serviceRequest) {
            return res.status(400).json({ errors: [{ msg: "Customer Service not found" }] });
        }

        await ServiceRequest.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        res.status(200).send({ message: 'Successfully updated the status of the Service Request' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ errors: [{ msg: "Invalid Service ID" }] });
        }
        res.send(error.message);
    }
});


module.exports = router;