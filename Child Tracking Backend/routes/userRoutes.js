const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const { generateToken, jwtAuthMiddleware } = require("../jwt");
const { sendOTPEmail } = require("../utlis/mailer");
const {
  generateOTP,
  hashOTP,
  isOtpExpired,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  MAX_VERIFY_ATTEMPTS
} = require("../utlis/otp");

const canResendOtp = (otpSentAt) => {
  if (!otpSentAt) return true;
  return Date.now() - new Date(otpSentAt).getTime() >= RESEND_COOLDOWN_MS;
};

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {
    let { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    email = email.trim().toLowerCase();
    username = username.trim();

    const existing = await User.findOne({
      $or: [{ email }, { username }]
    });

    /* VERIFIED USER → BLOCK */
    if (existing && existing.isVerified) {
      return res.status(400).json({ error: "User already exists" });
    }

    /* UNVERIFIED USER → RESEND OTP */
    if (existing && !existing.isVerified) {
      if (!canResendOtp(existing.otpSentAt)) {
        const waitSeconds = Math.ceil(
          (RESEND_COOLDOWN_MS - (Date.now() - new Date(existing.otpSentAt).getTime())) / 1000
        );
        return res.status(429).json({
          error: `Please wait ${waitSeconds}s before requesting a new OTP`
        });
      }

      const otp = generateOTP();
      existing.otpHash = hashOTP(otp);
      existing.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
      existing.otpSentAt = new Date();
      existing.otpAttemptCount = 0;
      existing.otpResendCount = (existing.otpResendCount || 0) + 1;
      await existing.save();

      await sendOTPEmail(existing.email, otp);

      return res.json({
        message: "Verification OTP sent to your Gmail",
        email: existing.email
      });
    }

    /* NEW USER */
    const otp = generateOTP();

    const user = new User({
      name,
      email,
      username,
      password,
      otpHash: hashOTP(otp),
      otpExpiry: new Date(Date.now() + OTP_TTL_MS),
      otpSentAt: new Date()
    });
    await user.save();
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "Verification OTP sent to your Gmail",
      email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Signup failed" });
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ error: "Account already verified. Please login." });
    }

    if (!user.otpHash || !user.otpExpiry) {
      return res.status(400).json({ error: "OTP not found. Please request a new OTP." });
    }

    if (isOtpExpired(user.otpExpiry)) {
      return res.status(400).json({ error: "OTP expired. Please request a new OTP." });
    }

    if (user.otpAttemptCount >= MAX_VERIFY_ATTEMPTS) {
      return res.status(429).json({ error: "Too many attempts. Please resend OTP." });
    }

    const incomingOtpHash = hashOTP(otp);
    if (incomingOtpHash !== user.otpHash) {
      user.otpAttemptCount += 1;
      await user.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.otpSentAt = undefined;
    user.otpAttemptCount = 0;
    user.otpResendCount = 0;
    await user.save();

    res.json({ message: "Account verified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

/* ================= RESEND OTP ================= */
router.post("/resend-otp", async (req, res) => {
  try {
    const email = req.body?.email?.toLowerCase().trim();
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.isVerified) {
      return res.status(400).json({ error: "Account already verified. Please login." });
    }

    if (!canResendOtp(user.otpSentAt)) {
      const waitSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - new Date(user.otpSentAt).getTime())) / 1000
      );
      return res.status(429).json({ error: `Please wait ${waitSeconds}s before resending` });
    }

    const otp = generateOTP();
    user.otpHash = hashOTP(otp);
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    user.otpSentAt = new Date();
    user.otpAttemptCount = 0;
    user.otpResendCount = (user.otpResendCount || 0) + 1;
    await user.save();

    await sendOTPEmail(user.email, otp);
    return res.json({ message: "New OTP sent to your Gmail" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Unable to resend OTP" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: "Please verify OTP first" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
      id: user._id,
      username: user.username
    });

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});


/* ================= PROFILE ================= */
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});




module.exports = router;
