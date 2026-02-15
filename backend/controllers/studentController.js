const Student = require("../models/Student");

exports.getAll = async (req, res, next) => {
  try {
    const students = await Student.find().populate("userId", "name email avatar").populate("guideId", "name").populate("teamId", "name");
    const mapped = students.map(s => ({
      id: s._id, name: s.userId?.name, email: s.userId?.email, avatar: s.userId?.avatar,
      skills: s.skills, teamId: s.teamId?._id, guideId: s.guideId?._id, guideName: s.guideId?.name,
      progress: s.progress, rating: s.rating, rollNumber: s.rollNumber, branch: s.branch, year: s.year,
    }));
    res.json(mapped);
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate("userId", "name email avatar").populate("guideId", "name");
    if (!student) return res.status(404).json({ success: false, message: "Profile not found" });
    res.json({ id: student._id, name: student.userId.name, email: student.userId.email, avatar: student.userId.avatar, skills: student.skills, languages: student.languages, rollNumber: student.rollNumber, branch: student.branch, year: student.year, progress: student.progress, rating: student.rating, guideId: student.guideId?._id, guideName: student.guideId?.name });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { skills, languages, rollNumber, branch, year } = req.body;
    const student = await Student.findOneAndUpdate({ userId: req.user._id }, { skills, languages, rollNumber, branch, year }, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: "Profile not found" });
    res.json(student);
  } catch (err) { next(err); }
};
