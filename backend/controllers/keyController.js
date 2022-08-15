const jwtDecoder = require("jwt-decode");
const Key = require("../models/keyModel");
const User = require('../models/userModel');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose")

exports.createKey = catchAsync(async (req, res, next) => {
    const id = jwtDecoder(req.cookies.jwt).id;

    const newKey = await Key.create({
        name: req.body.keyName,
        user: id,
        passphrase: req.body.passphrase,
        passphraseConfirm: req.body.passphraseConfirm,
    });
    res.status(201).json({ status: "success" });
});

exports.getPubilckey = catchAsync(async (req, res, next) => {
    const id = jwtDecoder(req.cookies.jwt).id;
    const newID = mongoose.Types.ObjectId(id);
    const user = await User.find({ "_id": newID });
    if (!user){
        return next(new AppError("Incorrect User", 401));
    }
    const pk = user[0].publicKey;
    res.status(200).json({
        pk
    })
})

exports.getAllKey = catchAsync(async (req, res, next) => {
    const id = jwtDecoder(req.cookies.jwt).id;
    const keys = await Key.find({ user: id });

    if (!keys || keys.length == 0) {
        return next(new AppError('You dont have a key yet, just create one'), 404);
    }
    res.status(200).json({
        keys
    })
});

exports.deleteKey = catchAsync(async (req,res,next)=>{
    const id = jwtDecoder(req.cookies.jwt).id;
    console.log(req.headers.id);
    const key = await Key.findOne({_id:req.headers.id});
    await Key.findOneAndDelete({_id:req.headers.id,user: id });
    res.status(200).json({status:"success"})
})