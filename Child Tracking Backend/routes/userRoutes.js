
const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const { generateToken, jwtAuthMiddleware } = require("../jwt");
const { generateOTP } = require("../utlis/otp"); 

/* ================= SIGNUP ================= */
/* SIGNUP */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const otp = generateOTP();

    const user = new User({
      name,
      email,
      username,
      password,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000 // 5 min
    });

    await user.save();

    /* TEMP: Log OTP (Later send email) */
    console.log("OTP:", otp);

    res.status(201).json({
      message: "OTP sent to email",
      email
    });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
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


/* VERIFY OTP */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Account verified successfully" });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
});

module.exports = router;
