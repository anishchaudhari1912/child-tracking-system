const crypto = require("crypto");

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
};

const isOtpExpired = (expiryDate) => {
  return !expiryDate || new Date(expiryDate).getTime() < Date.now();
};

module.exports = {
  generateOTP,
  hashOTP,
  isOtpExpired,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  MAX_VERIFY_ATTEMPTS
};