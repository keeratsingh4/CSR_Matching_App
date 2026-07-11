
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  title: { type: String, required: true },             // e.g. "Need wheelchair assistance"
  description: { type: String, required: true },
  category: { type: String, required: true },          // e.g. "Medical Escort", "Mobility Aid"
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
  views: { type: Number, default: 0 },                 // track interest
  shortlistedCount: { type: Number, default: 0 },       // track interest
  shortlistedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matchedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
