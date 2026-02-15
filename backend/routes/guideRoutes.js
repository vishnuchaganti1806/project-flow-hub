const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { getAll, getById } = require("../controllers/guideController");

router.get("/", protect, getAll);
router.get("/:id", protect, getById);

module.exports = router;
