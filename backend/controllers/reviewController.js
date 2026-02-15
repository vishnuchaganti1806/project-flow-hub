const Review = require("../models/Review");

exports.getAll = async (req, res, next) => {
  try {
    const reviews = await Review.find().populate("studentId", "name").populate("guideId", "name").sort("-createdAt");
    res.json(reviews.map(r => ({ id: r._id, studentId: r.studentId?._id, studentName: r.studentId?.name, guideId: r.guideId?._id, rating: r.rating, comment: r.comment, createdAt: r.createdAt })));
  } catch (err) { next(err); }
};

exports.getByStudent = async (req, res, next) => {
  try {
    const reviews = await Review.find({ studentId: req.params.id }).populate("guideId", "name").sort("-createdAt");
    res.json(reviews.map(r => ({ id: r._id, studentId: r.studentId, studentName: "", guideId: r.guideId?._id, rating: r.rating, comment: r.comment, createdAt: r.createdAt })));
  } catch (err) { next(err); }
};

exports.submit = async (req, res, next) => {
  try {
    const review = await Review.create({ ...req.body, guideId: req.user._id });
    res.status(201).json(review);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.json(review);
  } catch (err) { next(err); }
};
