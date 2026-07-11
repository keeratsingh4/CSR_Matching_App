const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

//  Create / broadcast a new notification (ADMIN only)
router.post("/broadcast", protect, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { message, expiresAt } = req.body;
    const notification = await Notification.create({
      message,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Broadcast sent successfully", notification });
  } catch (err) {
    console.error("Broadcast error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//  Get latest active notification
router.get("/latest", protect, async (req, res) => {
  try {
    const now = new Date();
    const latest = await Notification.findOne({
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name role");

    res.json(latest || null);
  } catch (err) {
    console.error("Get notification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
