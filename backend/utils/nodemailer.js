
const nodemailer = require("nodemailer");
// Create an smtp server
const config = {
    host: 'smtp.163.com',
    port: 465,
    auth: {
        user: process.env.EMAIL_ADDRESS, // Mail server account
        pass: process.env.EMAIL_AUTHCODE // SMTP License Code
    }
};
// Create an SMTP client object
const transporter = nodemailer.createTransport(config);

// Send Email
module.exports = function (mail) {
    return new Promise((res, rej) => {
        transporter.sendMail(mail, function (error, info) {
            if (error) {
                console.log(error)
                return res({ error })
            }
            console.log('mail sent:', info.response);
            res({ status: "success", res: info.response })
        });
    })
};