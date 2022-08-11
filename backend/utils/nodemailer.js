
const nodemailer = require("nodemailer");
//创建一个smtp服务器
const config = {
    host: 'smtp.163.com',
    port: 465,
    auth: {
        user: process.env.EMAIL_ADDRESS, //自己的邮箱账号
        pass: process.env.EMAIL_AUTHCODE //STMP授权码
    }
};
// 创建一个SMTP客户端对象
const transporter = nodemailer.createTransport(config);

//发送邮件
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