const Deadline = require("../models/Deadline");
const createNotification = require("../utils/createNotification");
const Student = require("../models/Student");

exports.getAll = async (req, res, next) => {
  try {
    const deadlines = await Deadline.find().sort("date");
    res.json(deadlines.map(d => ({ id: d._id, title: d.title, date: d.date, projectId: d.projectId, createdAt: d.createdAt })));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const deadline = await Deadline.create({ ...req.body, createdBy: req.user._id });
    // Notify all students
    const students = await Student.find().select("userId");
    for (const s of students) {
      await createNotification(s.userId, "New Deadline", `Deadline "${deadline.title}" set for ${new Date(deadline.date).toLocaleDateString()}.`, "warning");
    }
    res.status(201).json({ id: deadline._id, ...deadline.toObject() });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const deadline = await Deadline.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!deadline) return res.status(404).json({ success: false, message: "Deadline not found" });
    res.json(deadline);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Deadline.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deadline deleted" });
  } catch (err) { next(err); }
};
