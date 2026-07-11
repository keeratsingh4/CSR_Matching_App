const mongoose = require('mongoose');

const volunteerHourLogSchema = new mongoose.Schema({
  // ──────────────── Task & Volunteer Link ────────────────
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ──────────────── Hours Logged ────────────────
  hours: {
    type: Number,
    required: true,
    min: 0.5,
    max: 24,
    validate: {
      validator: function (v) {
        return v >= 0.5 && v <= 24;
      },
      message: 'Hours must be between 0.5 and 24'
    }
  },
  notes: { type: String },

  // ──────────────── Proof of Completion ────────────────
  proofType: { type: String, enum: ['Photo', 'Document', 'None'], default: 'None' },
  proofUrl: { type: String },

  // ──────────────── Verification (CSR Action) ────────────────
  verified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },

  // ──────────────── Dispute (CSR Action) ────────────────
  disputed: { type: Boolean, default: false },
  disputeReason: { type: String },
  disputedAt: { type: Date },

  // ──────────────── Logging Info ────────────────
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// ──────────────── Indexes for Aggregation & Reporting ────────────────
volunteerHourLogSchema.index({ volunteerId: 1, timestamp: -1 });
volunteerHourLogSchema.index({ taskId: 1 });
volunteerHourLogSchema.index({ verified: 1 });
volunteerHourLogSchema.index({ disputed: 1 });

// ──────────────── Schema Methods ────────────────

// Verify hours
volunteerHourLogSchema.methods.verify = function (csrRepId) {
  this.verified = true;
  this.verifiedBy = csrRepId;
  this.verifiedAt = new Date();
  this.disputed = false; // clear any dispute
  return this.save();
};

// Dispute hours
volunteerHourLogSchema.methods.dispute = function (reason) {
  this.disputed = true;
  this.disputeReason = reason || 'No reason provided';
  this.disputedAt = new Date();
  this.verified = false; // revoke verification
  return this.save();
};

module.exports = mongoose.model('VolunteerHourLog', volunteerHourLogSchema);
