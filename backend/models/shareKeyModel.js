const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const keySchema = new mongoose.Schema({
  shareId: {
    type: String,
    required: [true, "Please provide a shareId"],
  },
  publicKey: {
    type: String,
    required: [true, "Please provide a publicKey"],
  },
  privateKey: {
    type: String,
    required: [true, "Please provide a privateKey"],
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  visitedTimes: {
    type: Number,
    default: 0
  },
});

keySchema.methods.correctPassphrase = async function (
  candidatePassphrase,
  userPassphrase
) {
  return await bcrypt.compare(candidatePassphrase, userPassphrase);
};

const ShareKey = mongoose.model("ShareKey", keySchema);

module.exports = ShareKey;