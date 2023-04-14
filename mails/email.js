require('dotenv').config();
const nodemailer = require('nodemailer')

//*Configuring NodeMail Notification for Gmail
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 465,
    auth: {
        user: process.env.GMAIL_USER_NAME,
        pass: process.env.GMAIL_PASSWORD,
    }
})


//*Send email notification to user booking for services
async function sendEmailNotification(recipients, serviceRequest) {

    const mailOptions = {
        from: `"Africanachild Photography Service" <${process.env.PHOTOGRAPHY_SERVICE_MAIL}>`,
        to: recipients.join(','),
        subject: 'New Service Booking',
        text: `A new service has been booked. Details: $${JSON.stringify(serviceRequest)}`,
        html: ` <h1>A new service has been booked</h1>
    <p>Details:</p>
    <ul>
  <li>Name: ${serviceRequest.name}</li>
  <li>Email: ${serviceRequest.email}</li>
  <li>Phone Number: ${serviceRequest.phoneNumber}</li>
  <li>Service Type: ${serviceRequest.serviceType}</li>
  <li>Date: ${serviceRequest.date}</li>
  <li>Time: ${serviceRequest.time}</li>
  <li>Address: ${serviceRequest.address}</li>
    </ul>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email: ', error);
        } else {
            console.log('Email sent: ', info.response);
        }
    });
}

//*send userRegistration email notification
async function sendRegistrationEmail(user) {
    const mailOptions = {
        from: `"Africanachild Photography Service" <${process.env.PHOTOGRAPHY_SERVICE_MAIL}>`,
        to: user.email,
        subject: 'Registration Successful',
        text: `Dear ${user.username},\n\nThank you for registering with our Photography Service. We're excited to have you on board.`,
        html: `<h1>Registration Successful</h1>
    <p>Dear ${user.username},</p>
    <p>Thank you for registering with our Photography Service. We're excited to have you on board.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending registration email: ', error);
        } else {
            console.log('Registration email sent: ', info.response);
        }
    });
}

module.exports = {
    sendEmailNotification,
    sendRegistrationEmail,
};
