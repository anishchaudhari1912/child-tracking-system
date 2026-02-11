const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  //Dynamic safe zone per child
  safeZone: {
    lat: {type:Number,default:18.5204},//pune default
    lng:{type: Number,default:73.8567},
    radius:{type:Number,default:500} // meters
  }
});

module.exports = mongoose.model("Child", childSchema);
