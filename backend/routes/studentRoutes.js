const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { getAll, getProfile, updateProfile } = require("../controllers/studentController");

router.get("/", protect, getAll);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
