const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  rollNumber: { type: String, default: "" },
  branch: { type: String, default: "" },
  year: { type: String, default: "" },
  skills: [String],
  languages: [String],
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  progress: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
});

module.exports = mongoose.model("Student", studentSchema);
