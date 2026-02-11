const mongoose = require("mongoose");
require("dotenv").config();

const mongoURL = process.env.DB_URL;

mongoose
  .connect(mongoURL)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

module.exports = mongoose;   // ✅ CORRECT