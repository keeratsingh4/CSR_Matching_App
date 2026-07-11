const express = require('express');
const Request = require('../models/Request');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Summary report
router.get('/summary', protect, async (req, res) => {
  try {
    const totalRequests = await Request.countDocuments();

    // Count per category
    const categoryAgg = await Request.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Sum of shortlists per category
    const shortlistAgg = await Request.aggregate([
      { $group: { _id: "$category", totalShortlists: { $sum: "$shortlistedCount" } } }
    ]);

    const requestsPerCategory = {};
    categoryAgg.forEach(c => {
      requestsPerCategory[c._id] = c.count;
    });

    const shortlistsPerCategory = {};
    shortlistAgg.forEach(s => {
      shortlistsPerCategory[s._id] = s.totalShortlists;
    });

    res.json({
      totalRequests,
      requestsPerCategory,
      shortlistsPerCategory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
