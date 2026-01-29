const express = require("express");
const router = express.Router();
const Location = require("../Models/location");
const { jwtAuthMiddleware } = require("../jwt");

/* ADD / UPDATE LOCATION */
router.post("/:childId", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const location = new Location({
      child: req.params.childId,
      latitude,
      longitude
    });

    await location.save();
    res.json({ message: "Location updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update location" });
  }
});

/* GET LATEST LOCATION (Parent View) */
router.get("/latest/:childId", jwtAuthMiddleware, async (req, res) => {
  try {
    const location = await Location.findOne({
      child: req.params.childId
    }).sort({ createdAt: -1 });

    res.json(location);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

/* LOCATION HISTORY */
router.get("/history/:childId", jwtAuthMiddleware, async (req, res) => {
  const locations = await Location.find({
    child: req.params.childId
  }).sort({ createdAt: -1 }).limit(10);

  res.json(locations);
});


module.exports = router;
