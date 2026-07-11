const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  assignTaskToVolunteer,
  acceptTaskAssignment,
  declineTaskAssignment,
  getTaskDetails,
  getMyTasks,
  handleTaskTimeout
} = require('../controllers/taskAssignmentController');
const {
  completeTask,
  getCompletedHistory,
  verifyVolunteerHours,
  disputeVolunteerHours,
  getCompanyHourReport
} = require('../controllers/taskCompletionController');

// Task Assignment Routes (CV-01)
// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get('/my-tasks', protect, restrictTo('CORPORATE_VOLUNTEER'), getMyTasks);
router.get('/completed-history', protect, restrictTo('CORPORATE_VOLUNTEER'), getCompletedHistory);

router.post('/:id/assign', protect, restrictTo('CSR_REP'), assignTaskToVolunteer);
router.post('/:id/accept', protect, restrictTo('CORPORATE_VOLUNTEER'), acceptTaskAssignment);
router.post('/:id/decline', protect, restrictTo('CORPORATE_VOLUNTEER'), declineTaskAssignment);
router.post('/:id/timeout', protect, restrictTo('ADMIN', 'PLATFORM_ADMIN'), handleTaskTimeout);
router.post('/:id/complete', protect, restrictTo('CORPORATE_VOLUNTEER'), completeTask);
router.get('/:id', protect, getTaskDetails);

module.exports = router;
