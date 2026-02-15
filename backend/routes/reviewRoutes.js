const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { getAll, getByStudent, submit, update } = require("../controllers/reviewController");

router.get("/", protect, getAll);
router.get("/student/:id", protect, getByStudent);
router.post("/", protect, authorize("guide"), submit);
router.put("/:id", protect, authorize("guide"), update);

module.exports = router;
