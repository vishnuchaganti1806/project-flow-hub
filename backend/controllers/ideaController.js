const Idea = require("../models/Idea");
const createNotification = require("../utils/createNotification");

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    const ideas = await Idea.find(filter).populate("studentId", "name").sort("-updatedAt");
    const mapped = ideas.map(i => ({ id: i._id, title: i.title, abstract: i.abstract, problemStatement: i.problemStatement, techStack: i.techStack, expectedOutcome: i.expectedOutcome, status: i.status, studentId: i.studentId?._id, studentName: i.studentId?.name, guideFeedback: i.feedback, submittedAt: i.submittedAt, updatedAt: i.updatedAt, attachments: i.attachments }));
    res.json(mapped);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id).populate("studentId", "name");
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    res.json({ id: idea._id, title: idea.title, abstract: idea.abstract, problemStatement: idea.problemStatement, techStack: idea.techStack, expectedOutcome: idea.expectedOutcome, status: idea.status, studentId: idea.studentId?._id, studentName: idea.studentId?.name, guideFeedback: idea.feedback, submittedAt: idea.submittedAt, updatedAt: idea.updatedAt, attachments: idea.attachments });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    req.body.studentId = req.user._id;
    if (req.files) req.body.attachments = req.files.map(f => `/uploads/${f.filename}`);
    const idea = await Idea.create(req.body);
    res.status(201).json({ id: idea._id, ...idea.toObject() });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    if (idea.studentId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    Object.assign(idea, req.body);
    await idea.save();
    res.json({ id: idea._id, ...idea.toObject() });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;
    const idea = await Idea.findByIdAndUpdate(req.params.id, { status, feedback }, { new: true });
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    const type = status === "approved" ? "success" : status === "rejected" ? "error" : "info";
    await createNotification(idea.studentId, `Idea ${status}`, `Your idea "${idea.title}" has been ${status}.`, type);
    res.json({ id: idea._id, ...idea.toObject() });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    if (idea.studentId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Not authorized" });
    await idea.deleteOne();
    res.json({ success: true, message: "Idea deleted" });
  } catch (err) { next(err); }
};
