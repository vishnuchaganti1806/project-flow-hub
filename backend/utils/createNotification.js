const Notification = require("../models/Notification");

module.exports = async (userId, title, message, type = "info") => {
  try {
    await Notification.create({ userId, title, message, type });
  } catch (err) {
    console.error("Notification creation failed:", err.message);
  }
};
