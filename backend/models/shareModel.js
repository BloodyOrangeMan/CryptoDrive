const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const { genSignKeyPair } = require("../utils/cryptoFeatures");

const shareSchema = new mongoose.Schema({
  token: {
    unique: true,
    type: String,
    required: [true, "Please!"],
  },
  key:{
    type: String,
    required: [true, "Please!"],
  },
  count:String,
  ddl:String,
  jwtid:String,
  filename:String,
});

const Share = mongoose.model("Share", shareSchema);

module.exports = Share;
