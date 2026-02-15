const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { getAll, markRead, markAllRead } = require("../controllers/notificationController");

router.get("/", protect, getAll);
router.patch("/:id/read", protect, markRead);
router.patch("/read-all", protect, markAllRead);

module.exports = router;
