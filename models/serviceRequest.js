const mongoose = require('mongoose');
//* Database Schema for serviceRequest collection

/*
* The message field in the ServiceRequest schema is an optional field that
* allows customers to provide additional information about their service
* request. This field can be used for customers to provide specific 
* instructions or requests for their service, such as the preferred 
* style, specific props, or any other requirements they may have.
* provides a way for customers to provide additional information 
* about their service request, which can be helpful for the owner 
* to better understand the customer's needs and ensure that the 
*service is performed to their satisfaction.
* The status field is used to keep track of the progress of a 
* service request and can have different values depending on the 
* requirements of your application.
* pending: The service request has been made by the customer but has not been confirmed by the owner yet.
* confirmed: The service request has been confirmed by the owner.
* cancelled: The service request has been cancelled either by the customer or the owner.
* completed: The service request has been completed.
*/

const serviceRequest = mongoose.model('ServiceRequest', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    phoneNumber: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    serviceType: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    date: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    time: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    address: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100
    },
    message: {
        type: String,
    },
    status: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50,
        enum: ["pending", "confirmed", "cancelled", "completed"]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}));

module.exports = serviceRequest;