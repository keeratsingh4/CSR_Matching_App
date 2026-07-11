const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
// public
async function registerUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please include name, email, and password' });
    }

    const alreadyExists = await User.findOne({ email });
    if (alreadyExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// POST /api/auth/login
// public
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login attempt failed: User not found for email ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await user.matchPassword(password);
    if (!passwordMatch) {
      console.log(`Login attempt failed: Invalid password for email ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      console.log(`Login attempt blocked: Suspended account for email ${email}`);
      return res.status(403).json({ message: 'Your account has been suspended. Please contact admin.' });
    }

    console.log(`Login successful: ${user.email} (${user.role})`);
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login', error: err.message });
  }
}

// GET /api/auth/me
// private
async function getMe(req, res) {
  return res.json(req.user);
}

module.exports = { registerUser, loginUser, getMe };
