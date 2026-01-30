const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true
  },

  username: {
    type: String,
    trim: true,
    required: true
  },

  password: { type: String, required: true },

  otp: String,
  otpExpiry: Date,

  isVerified: { type: Boolean, default: false }
});

/* HASH PASSWORD */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* COMPARE PASSWORD */
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
