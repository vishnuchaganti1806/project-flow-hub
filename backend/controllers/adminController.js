const User = require("../models/User");
const Student = require("../models/Student");
const Guide = require("../models/Guide");
const Team = require("../models/Team");
const Idea = require("../models/Idea");
const Review = require("../models/Review");
const createNotification = require("../utils/createNotification");

exports.getStats = async (req, res, next) => {
  try {
    const [totalStudents, totalGuides, totalTeams, totalIdeas, approvedIdeas, rejectedIdeas, pendingReviews] = await Promise.all([
      Student.countDocuments(),
      Guide.countDocuments(),
      Team.countDocuments(),
      Idea.countDocuments(),
      Idea.countDocuments({ status: "approved" }),
      Idea.countDocuments({ status: "rejected" }),
      Idea.countDocuments({ status: { $in: ["submitted", "under-review"] } }),
    ]);
    res.json({ totalStudents, totalGuides, totalTeams, totalIdeas, approvedIdeas, rejectedIdeas, pendingReviews, activeProjects: approvedIdeas });
  } catch (err) { next(err); }
};

exports.assignStudentToGuide = async (req, res, next) => {
  try {
    const { studentId, guideId } = req.body;
    const student = await Student.findByIdAndUpdate(studentId, { guideId }, { new: true });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    await createNotification(student.userId, "Guide Assigned", "An admin has assigned you a guide.", "info");
    res.json({ success: true, student });
  } catch (err) { next(err); }
};
