const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., "TASK_ASSIGNED", "TASK_ACCEPTED", "HOURS_LOGGED"
  entityType: { type: String, required: true }, // e.g., "Task", "User", "VolunteerHourLog"
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  details: { type: mongoose.Schema.Types.Mixed }, // Additional contextual data
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for querying and reporting
auditLogSchema.index({ actorId: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

// Static method to log an action
auditLogSchema.statics.logAction = async function(actorId, action, entityType, entityId, details = {}, req = null) {
  const logEntry = {
    actorId,
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date()
  };

  // Optionally capture request metadata
  if (req) {
    logEntry.ipAddress = req.ip || req.connection.remoteAddress;
    logEntry.userAgent = req.get('user-agent');
  }

  return this.create(logEntry);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
