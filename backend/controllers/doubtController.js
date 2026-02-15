const Doubt = require("../models/Doubt");

exports.getAll = async (req, res, next) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user._id } : req.user.role === "guide" ? { guideId: req.user._id } : {};
    const doubts = await Doubt.find(filter).populate("studentId", "name").populate("guideId", "name").sort("-createdAt");
    const mapped = doubts.map(d => ({ id: d._id, studentId: d.studentId?._id, studentName: d.studentId?.name, guideId: d.guideId?._id, guideName: d.guideId?.name, subject: d.subject, messages: d.replies, resolved: d.status === "resolved" }));
    res.json(mapped);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const doubt = await Doubt.create({ ...req.body, studentId: req.user._id, replies: [{ sender: req.user.name, text: req.body.message, timestamp: new Date() }] });
    res.status(201).json(doubt);
  } catch (err) { next(err); }
};

exports.reply = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: "Doubt not found" });
    doubt.replies.push({ sender: req.user.name, text: req.body.text, timestamp: new Date() });
    await doubt.save();
    res.json(doubt);
  } catch (err) { next(err); }
};

exports.resolve = async (req, res, next) => {
  try {
    const doubt = await Doubt.findByIdAndUpdate(req.params.id, { status: "resolved" }, { new: true });
    if (!doubt) return res.status(404).json({ success: false, message: "Doubt not found" });
    res.json(doubt);
  } catch (err) { next(err); }
};
