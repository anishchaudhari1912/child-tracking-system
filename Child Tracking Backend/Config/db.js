const mongoose = require("mongoose");
require("dotenv").config();

const mongoURL = process.env.DB_URL;

mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("MongoDB connected successfully");
});

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

console.log("MongoDB URL:", process.env.DB_URL);

module.exports = db;
