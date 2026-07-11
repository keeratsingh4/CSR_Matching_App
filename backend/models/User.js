const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['PIN', 'CSR_REP', 'ADMIN', 'CORPORATE_VOLUNTEER', 'USER_ADMIN', 'PLATFORM_ADMIN'],
    default: 'PIN'
  },
  // Corporate Volunteer specific fields
  skills: { type: [String], default: [] },
  availability: { type: [String], default: [] },
  profileCompleted: { type: Boolean, default: false },
  // CSR Rep specific fields
  company: { type: String },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  // Additional user fields
  lastLogin: { type: Date },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper to compare passwords at login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
