const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

//  Register new user
router.post('/register', registerUser);

//  Login
router.post('/login', loginUser);

//  Get all users (Admin and CSR_REP)
router.get('/users', protect, async (req, res) => {
  try {
    // Allow ADMIN and CSR_REP to view users
    if (!['ADMIN', 'CSR_REP'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view users' });
    }

    // CSR_REP can only see CORPORATE_VOLUNTEER users
    let query = {};
    if (req.user.role === 'CSR_REP') {
      query.role = 'CORPORATE_VOLUNTEER';
    }

    const users = await User.find(query, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
