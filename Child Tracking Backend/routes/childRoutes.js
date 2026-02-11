const express = require("express");
const router = express.Router();
const Child = require("../Models/child");
const { jwtAuthMiddleware } = require("../jwt");

/* ADD CHILD */
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    const { name, age } = req.body;

    const child = new Child({
      name,
      age,
      parent: req.user.id
    });

    await child.save();
    res.status(201).json(child);
  } catch (err) {
    res.status(500).json({ error: "Failed to add child" });
  }
});

/* GET CHILDREN OF LOGGED-IN PARENT */
router.get("/", jwtAuthMiddleware, async (req, res) => {
  try {
    const children = await Child.find({ parent: req.user.id });
    res.json(children);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch children" });
  }
});

// SET SAFE ZONE (Parent)
router.put("/safezone/:childId", jwtAuthMiddleware, async (req, res) => {
  try {
    const { lat, lng, radius } = req.body;

    const child = await Child.findByIdAndUpdate(
      req.params.childId,
      {
        safeZone: { lat, lng, radius }
      },
      { new: true }
    );

    res.json({ message: "Safe zone updated", child });
  } catch (err) {
    res.status(500).json({ error: "Failed to update safe zone" });
  }
});

module.exports = router;
