const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { getStats, assignStudentToGuide } = require("../controllers/adminController");

router.get("/stats", protect, authorize("admin"), getStats);
router.post("/assign", protect, authorize("admin"), assignStudentToGuide);

module.exports = router;
