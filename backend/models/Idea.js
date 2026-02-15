const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  abstract: { type: String, default: "" },
  problemStatement: { type: String, default: "" },
  techStack: [String],
  expectedOutcome: { type: String, default: "" },
  attachments: [String],
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["draft", "submitted", "under-review", "approved", "rejected"], default: "draft" },
  feedback: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ideaSchema.pre("save", function (next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model("Idea", ideaSchema);
