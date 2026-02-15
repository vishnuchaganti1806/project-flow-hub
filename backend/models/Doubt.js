const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Idea" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  replies: [{ sender: String, text: String, timestamp: { type: Date, default: Date.now } }],
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Doubt", doubtSchema);
