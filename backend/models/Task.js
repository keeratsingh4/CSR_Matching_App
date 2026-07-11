const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, required: true },
  // Task scheduling
  scheduledStart: { type: Date, required: true },
  scheduledEnd: { type: Date, required: true },
  // Skills required for the task
  requiredSkills: { type: [String], default: [] },
  // Status: Available, Assigned, Confirmed, InProgress, Completed, Declined
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'Confirmed', 'InProgress', 'Completed', 'Declined'],
    default: 'Available'
  },
  // Related to Request (PIN's help request)
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  // Person in need who created the original request
  personInNeed: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // CSR Representative who manages this task
  csrRep: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Corporate Volunteer assigned to this task
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Completion tracking
  completedAt: { type: Date },
  actualHours: { type: Number },
  // View tracking
  viewCount: { type: Number, default: 0 },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Method to change task status with validation
taskSchema.methods.changeStatus = function(newStatus) {
  const validTransitions = {
    'Available': ['Assigned'],
    'Assigned': ['Confirmed', 'Declined', 'Available'],
    'Confirmed': ['InProgress', 'Declined'],
    'InProgress': ['Completed'],
    'Completed': [],
    'Declined': ['Available']
  };

  if (validTransitions[this.status].includes(newStatus)) {
    this.status = newStatus;
    return true;
  }
  return false;
};

// Method to mark task as completed
taskSchema.methods.markCompleted = function(hours) {
  if (this.status === 'InProgress' || this.status === 'Confirmed') {
    this.status = 'Completed';
    this.completedAt = new Date();
    this.actualHours = hours;
    return true;
  }
  return false;
};

module.exports = mongoose.model('Task', taskSchema);
