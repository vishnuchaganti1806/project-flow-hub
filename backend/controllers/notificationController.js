const Notification = require("../models/Notification");

exports.getAll = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort("-createdAt").limit(50);
    res.json(notifications.map(n => ({ id: n._id, title: n.title, message: n.message, type: n.type, read: n.read, createdAt: n.createdAt })));
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};
