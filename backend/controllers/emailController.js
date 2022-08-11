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
        from: process.env.EMAIL_ADDRESS,// Sender/Mailbox Server
        subject: 'Retrieve password',// Email subject
        to: email,// Recipient
        // Email content, HTML format
        text: `The verification code for ${name} is ${code}, and the valid time is ${process.env.EMAIL_TIMEOUT} minutes.`//Send verification code
    };

    // Send Email
    let sendMail = await nodemailer(mail);
    if (!sendMail || sendMail.error) return next(new AppError('Mailbox service error', 400))

    const newEmailCode = await Email.create({
        email,
        code,
        user: _id,
        type: 'resetPsw'
    })

    res.status(200).json({ status: "success", message: `The validity of the verification code is ${process.env.EMAIL_TIMEOUT} minutes.` });
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

    // If no verification code has been sent
    if (!emailBox) return next(new AppError('Obtain the verification code first', 401))

    const { code: eCode, sendTime, used } = emailBox

    // If the verification code has been used
    if (used) return next(new AppError("The verification code has been used!", 401));

    // Captcha verification
    if (code != eCode) return next(new AppError('Code Error', 401))

    // Ten minutes validity
    if ((Date.now() - sendTime) > (Number(process.env.EMAIL_TIMEOUT || 10) * 60000)) return next(new AppError('Verification code timeout', 401))

    // Update user password
    let changeUser = await User.updateOne({ email: uemail }, { password, passwordConfirm });

    // Update Captcha usage status
    await Email.updateOne({ email: uemail, code }, { used: true })

    res.status(200).json({ status: "success", changeUser });
});