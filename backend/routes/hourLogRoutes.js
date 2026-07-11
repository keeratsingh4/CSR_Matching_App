const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  verifyVolunteerHours,
  disputeVolunteerHours,
  getCompanyHourReport
} = require('../controllers/taskCompletionController');

const VolunteerHourLog = require('../models/VolunteerHourLog');

//  Get all volunteer hour logs (CSR view)
router.get('/', protect, restrictTo('CSR_REP'), async (req, res) => {
  try {
    const logs = await VolunteerHourLog.find()
      .populate('taskId', 'title category status completedAt')
      .populate('volunteerId', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching hour logs:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
});

//  Verify volunteer hours
router.post('/:id/verify', protect, restrictTo('CSR_REP'), verifyVolunteerHours);

//  Dispute volunteer hours
router.post('/:id/dispute', protect, restrictTo('CSR_REP'), disputeVolunteerHours);

//  Generate company report (CSR dashboard summary)
router.get('/company-report', protect, restrictTo('CSR_REP'), getCompanyHourReport);

module.exports = router;
