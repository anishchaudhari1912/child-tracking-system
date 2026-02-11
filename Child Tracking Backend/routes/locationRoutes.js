const express = require("express");
const router = express.Router();
const Location = require("../Models/location");
const { jwtAuthMiddleware } = require("../jwt");
const Child=require("../Models/child");

/* ================= SAFE ZONE UTILITY ================= */
const isOutsideSafeZone = (childLat, childLng, zone) => {
  const toRad = (v) => (v * Math.PI) / 180;

  const R = 6371000; // meters
  const dLat = toRad(childLat - zone.lat);
  const dLng = toRad(childLng - zone.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(zone.lat)) *
      Math.cos(toRad(childLat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c > zone.radius;
};

/* ================= ADD / UPDATE LOCATION ================= */
router.post("/:childId", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: "Latitude & Longitude required" });
    }

    const location = new Location({
      child: req.params.childId, // ✅ FIXED
      latitude,
      longitude
    });

    await location.save();
    res.json({ message: "Location updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update location" });
  }
});

/* ================= GET LATEST LOCATION ================= */
router.get("/latest/:childId", jwtAuthMiddleware, async (req, res) => {
  try {
    const location = await Location.findOne({
      child: req.params.childId
    }).sort({ createdAt: -1 });

    if (!location) {
      return res.json(null); // frontend expects this
    }

    const child = await Child.findById(req.params.childId);

    if (!child || !child.safeZone) {
      return res.status(400).json({ error: "Safe zone not set for this child" });
    }

    res.json({
      latitude: location.latitude,
      longitude: location.longitude,
      createdAt: location.createdAt,
      safeZone: child.safeZone   // ✅ VERY IMPORTANT ADDITION
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Location fetch failed" });
  }
});
/* ================= LOCATION HISTORY ================= */
router.get("/history/:childId", jwtAuthMiddleware, async (req, res) => {
  const locations = await Location.find({
    child: req.params.childId
  })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json(locations);
});

module.exports = router;
