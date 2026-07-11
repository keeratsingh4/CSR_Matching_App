const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date },                 // optional expiry date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
