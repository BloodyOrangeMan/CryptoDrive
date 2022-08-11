const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const keySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Please give your key a name!"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Key must belong to a user!'],
    select: false,
  },
  passphrase: {
    type: String,
    required: [true, "Please provide a passphrase"],
    minlength: 8,
    select: false,
  },
  passphraseConfirm: {
    type: String,
    required: [true, "Please confirm your passphrase"],
    validate: {
      validator: function (el) {
        return el === this.passphrase;
      },
      message: "Passphrase are not the same!",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  times: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

keySchema.pre("save", async function (next) {
  // Only run this function if passphrase was actually modified
  if (!this.isModified("passphrase")) return next();

  // Hash the passphrase with cost of 12
  this.passphrase = await bcrypt.hash(this.passphrase, 12);

  // Delete passphraseConfirm field
  this.passphraseConfirm = undefined;
  next();
});

keySchema.methods.correctPassphrase = async function (
    candidatePassphrase,
    userPassphrase
  ) {
    return await bcrypt.compare(candidatePassphrase, userPassphrase);
  };

const Key = mongoose.model("Key", keySchema);

module.exports = Key;