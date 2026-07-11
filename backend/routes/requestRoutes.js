const express = require('express');
const { createRequest, listRequests } = require('../controllers/requestController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { assignRequestToVolunteer } = require('../controllers/requestAssignmentController');
const Request = require('../models/Request');

const router = express.Router();

// anyone can GET to browse opportunities
router.get('/', listRequests);

// only authenticated users (e.g. PIN) can POST new requests
router.post('/', protect, createRequest);

//
//  NEW: Service history route for PIN-07 & PIN-08
//
router.get('/history', protect, async (req, res) => {
  try {
    if (req.user.role !== 'PIN') {
      return res.status(403).json({ message: 'Only PIN users can view history' });
    }

    const { category, from, to } = req.query;
    const filter = { createdBy: req.user._id, status: 'Completed' };

    if (category) filter.category = category;
    if (from || to) filter.completedAt = {};
    if (from) filter.completedAt.$gte = new Date(from);
    if (to) filter.completedAt.$lte = new Date(to);

    const history = await Request.find(filter)
      .populate('matchedTo', 'name')
      .sort({ completedAt: -1 });

    res.json(history);
  } catch (error) {
    console.error('History route error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//
//  Toggle shortlist (Volunteer can shortlist or unshortlist)
//
router.put('/:id/shortlist', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (!request.shortlistedBy) request.shortlistedBy = [];

    const userId = req.user._id.toString();
    const alreadyShortlisted = request.shortlistedBy.includes(userId);

    if (alreadyShortlisted) {
      request.shortlistedBy = request.shortlistedBy.filter(id => id.toString() !== userId);
      request.shortlistedCount = Math.max(0, (request.shortlistedCount || 0) - 1);
    } else {
      request.shortlistedBy.push(userId);
      request.shortlistedCount = (request.shortlistedCount || 0) + 1;
    }

    await request.save();

    const updated = await Request.findById(req.params.id).populate('createdBy', 'name role');
    res.json({
      message: alreadyShortlisted ? "Unshortlisted successfully" : "Shortlisted successfully",
      shortlisted: !alreadyShortlisted,
      request: updated,
    });
  } catch (error) {
    console.error("Shortlist toggle error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
//  Mark a request as completed (Admin or CSR only)
router.put('/:id/complete', protect, async (req, res) => {
  try {
    if (!['ADMIN', 'CSR_REP'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to complete requests' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'Completed';
    request.completedAt = new Date();
    // FIX: Assign the volunteer/admin who completed this request
    request.matchedTo = req.user._id;
    await request.save();

    const populated = await Request.findById(req.params.id)
      .populate('createdBy', 'name role')
      .populate('matchedTo', 'name role');

    res.json({ message: 'Request marked as completed', request: populated });
  } catch (error) {
    console.error('Complete request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//
//  Delete a request (Admin only)
//
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized: Admins only' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await request.deleteOne();
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//
//  Assign request to volunteer (CSR Rep creates task)
//
router.post('/:id/assign', protect, restrictTo('CSR_REP'), assignRequestToVolunteer);

module.exports = router;
