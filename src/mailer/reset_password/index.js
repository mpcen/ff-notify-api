const nodemailer = require('nodemailer');

const { NODEMAILER_SERVICE_CLIENT, NODEMAILER_PRIVATE_KEY } = process.env;

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
            type: 'OAuth2',
            user: 'admin@persource.gg',
            serviceClient: NODEMAILER_SERVICE_CLIENT,
            privateKey: NODEMAILER_PRIVATE_KEY
        }
    });

    try {
        await transporter.verify();

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"PerSource.gg" <admin@persource.gg>', // sender address
            to: email, // list of receivers
            subject: 'Reset your password', // Subject line
            html: `
                <p>To reset your password, click the following link:</p>
                <p><a href=${generatedUrl}>${generatedUrl}</a></p>
            ` // html body
        });

        // console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } catch (e) {
        console.log('Error inside mailer:', e);
        throw new Error('Error sending transporter email message');
    }
};

module.exports = { mailer };