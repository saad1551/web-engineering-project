const nodemailer = require('nodemailer');

const sendEMail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.send_to,
        subject: options.subject,
        html: options.content
    };

    await transporter.sendMail(mailOptions);
}

module.exports = sendEMail;