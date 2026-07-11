const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

//  Suspend or unsuspend a user (admin only)
router.put('/users/:id/suspend', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admins only.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // toggle status
    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    res.json({
      message: `User ${user.status === 'suspended' ? 'suspended' : 'reactivated'} successfully`,
      user,
    });
  } catch (err) {
    console.error('Suspend error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
