const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const { generateToken,jwtAuthMiddleware  } = require("../jwt");
const { generateOTP } = require("../utlis/otp");

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {
    let { name, email, username, password } = req.body;

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
      existing.otp = generateOTP();
      existing.otpExpiry = Date.now() + 5 * 60 * 1000;
      await existing.save();

      console.log("Resent OTP:", existing.otp);

      return res.json({
        message: "OTP re-sent",
        email: existing.email,
        otp: existing.otp // DEV ONLY
      });
    }

    /* NEW USER */
    const otp = generateOTP();

    const user = new User({
      name,
      email,
      username,
      password,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000
    });

    await user.save();

    console.log("OTP:", otp);

    res.status(201).json({
      message: "OTP sent",
      email,
      otp // DEV ONLY
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({ message: "Account verified" });
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username: username.trim() });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  if (!user.isVerified) {
    return res.status(401).json({ error: "Verify OTP first" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const token = generateToken({ id: user._id });
  res.json({ token });
});

/* ================= PROFILE ================= */
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

module.exports = router;
