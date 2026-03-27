const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (to, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS are required for OTP email delivery");
  }

  try {
    await transporter.sendMail({
      from: `"Child Tracking System" <${process.env.EMAIL_USER}>`,
      to,
      subject: "OTP Verification",
      html: `
        <h2>Verify Your Account</h2>
        <p>Your one-time verification code is:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>This code is valid for 5 minutes.</p>
      `
    });
  } catch (error) {
    throw new Error("Unable to send OTP email. Check Gmail app password configuration.");
  }
};

module.exports = { sendOTPEmail };
