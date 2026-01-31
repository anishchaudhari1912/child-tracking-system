const express = require("express");
const router = express.Router();
const Location = require("../Models/location");
const { jwtAuthMiddleware } = require("../jwt");

// utils/geoFence.js (OPTIONAL: or paste directly in locationRoutes.js)
const isOutsideSafeZone = (childLat, childLng, zone) => {
  const toRad = (v) => (v * Math.PI) / 180;

  const R = 6371000; // Earth radius in meters
  const dLat = toRad(childLat - zone.lat);
  const dLng = toRad(childLng - zone.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(zone.lat)) *
      Math.cos(toRad(childLat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance > zone.radius;
};




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
  const location = await Location.findOne({ child: childId }).sort({ createdAt: -1 });
  const child = await Child.findById(childId);

  let unsafe = false;

  if (child.safeZone) {
    unsafe = isOutsideSafeZone(
      location.latitude,
      location.longitude,
      child.safeZone
    );
  }

  res.json({
    latitude: location.latitude,
    longitude: location.longitude,
    unsafe
  });

});

/* LOCATION HISTORY */
router.get("/history/:childId", jwtAuthMiddleware, async (req, res) => {
  const locations = await Location.find({
    child: req.params.childId
  }).sort({ createdAt: -1 }).limit(10);

  res.json(locations);
});





module.exports = {router,isOutsideSafeZone};
