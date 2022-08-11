const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const { genSignKeyPair } = require("../utils/cryptoFeatures");

const emailSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please enter the verification code!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Key must belong to a user!'],
    select: false,
  },
  sendTime: Date,
  type: String,
  used: {
    type: Boolean,
    default: false,
  }
});


emailSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  this.sendTime = Date.now();
  next();
});

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;
