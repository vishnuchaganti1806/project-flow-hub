const Guide = require("../models/Guide");

exports.getAll = async (req, res, next) => {
  try {
    const guides = await Guide.find().populate("userId", "name email avatar");
    const mapped = guides.map(g => ({
      id: g._id, name: g.userId?.name, email: g.userId?.email, avatar: g.userId?.avatar,
      department: g.department, specialization: g.specialization ? [g.specialization] : [],
      assignedStudents: g.assignedTeams?.length || 0,
    }));
    res.json(mapped);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const guide = await Guide.findById(req.params.id).populate("userId", "name email avatar");
    if (!guide) return res.status(404).json({ success: false, message: "Guide not found" });
    res.json({ id: guide._id, name: guide.userId.name, email: guide.userId.email, avatar: guide.userId.avatar, department: guide.department, specialization: guide.specialization ? [guide.specialization] : [] });
  } catch (err) { next(err); }
};
