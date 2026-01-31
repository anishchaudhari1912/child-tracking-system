const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  safeZone: {
    lat: Number,
    lng: Number,
    radius: Number // meters
  }
});

module.exports = mongoose.model("Child", childSchema);
