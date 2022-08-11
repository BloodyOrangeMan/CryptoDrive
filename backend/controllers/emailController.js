const catchAsync = require("../utils/catchAsync");
const nodemailer = require("../utils/nodemailer");
const Email = require("../models/emailModel");
const AppError = require("./../utils/appError");
const User = require("../models/userModel");


function createCode(len = 6) {
    var Num = "";
    for (var i = 0; i < len; i++) {
        Num += Math.floor(Math.random() * 10);
    }
    return Num;
}

exports.sendCode = catchAsync(async (req, res, next) => {
    const { email: uemail } = req.body;
    let user = null;
    try {
        user = await User.findOne({ email: uemail })
    }
    catch (err) { console.log(err) }

    if (!user) return next(new AppError('The email address is not registered', 401))

    const { _id, email, name } = user;
    let code = createCode();
    let mail = {
        from: process.env.EMAIL_ADDRESS,// 发件人 自己邮箱
        subject: '找回密码',//邮箱主题|标题
        to: email,// 收件人
        // 邮件内容，HTML格式
        text: `${name}的验证码${code},有效期${process.env.EMAIL_TIMEOUT}分钟`//发送验证码
    };

    // 发送邮件
    let sendMail = await nodemailer(mail);
    if (!sendMail || sendMail.error) return next(new AppError('Mailbox service error', 400))

    const newEmailCode = await Email.create({
        email,
        code,
        user: _id,
        type: 'resetPsw'
    })

    res.status(200).json({ status: "success", message: `有效期${process.env.EMAIL_TIMEOUT}分钟` });
})

exports.resetPsw = catchAsync(async (req, res, next) => {
    const { email: uemail, code, password, passwordConfirm } = req.body;
    if (password != passwordConfirm) { return next(new AppError("Passwords are not the same!", 401)); }
    let user = null, emailBox = null;
    try {
        user = await User.findOne({ email: uemail })
        emailBox = await Email.findOne({ email: uemail, type: 'resetPsw' }).sort({ sendTime: -1 })
    }
    catch (err) { console.log(err) }

    if (!user) return next(new AppError('The email address is not registered', 401))

    //没有发送过验证码
    if (!emailBox) return next(new AppError('Obtain the verification code first', 401))

    const { code: eCode, sendTime, used } = emailBox

    //验证码已使用
    if (used) return next(new AppError("The verification code has been used!", 401));

    //验证码校验
    if (code != eCode) return next(new AppError('Code Error', 401))



    //十分钟有效期
    if ((Date.now() - sendTime) > (Number(process.env.EMAIL_TIMEOUT || 10) * 60000)) return next(new AppError('Verification code timeout', 401))



    //更新用户密码
    let changeUser = await User.updateOne({ email: uemail }, { password, passwordConfirm });

    //更新验证码使用状态
    await Email.updateOne({ email: uemail, code }, { used: true })

    res.status(200).json({ status: "success", changeUser });
});