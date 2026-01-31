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
router.put("/:id/safe-zone", jwtAuthMiddleware, async (req, res) => {
  try {
    const { lat, lng, radius } = req.body;

    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    child.safeZone = {
      lat,
      lng,
      radius
    };

    await child.save();

    res.json({ message: "Safe zone updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update safe zone" });
  }
});


module.exports = router;
