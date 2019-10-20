'use strict';

const nodemailer = require('nodemailer');

const { NODEMAILER_PASSWORD } = process.env;

// async..await is not allowed in global scope, must use a wrapper
const mailer = async (email, generatedUrl) => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'mouseplaycen1@gmail.com', // generated ethereal user
            pass: NODEMAILER_PASSWORD // generated ethereal password
        }
    });

    try {
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"PerSource.gg Support" <support@persource.gg>', // sender address
            to: email, // list of receivers
            subject: 'One-time password reset for PerSource.gg', // Subject line
            html: `
                <p>To reset your PerSource.gg password, click the following link:</p>
                <p><a href=${generatedUrl}>${generatedUrl}</a></p>
            ` // html body
        });

        // console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } catch (e) {
        return res.status(422).send('Error sending transporter email message');
    }
};

module.exports = { mailer };
