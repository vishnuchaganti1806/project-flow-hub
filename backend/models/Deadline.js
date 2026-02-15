const mongoose = require("mongoose");

const deadlineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Idea" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Deadline", deadlineSchema);
