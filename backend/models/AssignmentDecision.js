const mongoose = require('mongoose');

const assignmentDecisionSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  decision: {
    type: String,
    enum: ['Accept', 'Decline', 'Timeout'],
    required: true
  },
  reason: { type: String }, // Optional reason for decline
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for quick lookups
assignmentDecisionSchema.index({ taskId: 1, volunteerId: 1 });
assignmentDecisionSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AssignmentDecision', assignmentDecisionSchema);
