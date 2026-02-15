const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { getAll, create, update, remove } = require("../controllers/deadlineController");

router.get("/", protect, getAll);
router.post("/", protect, authorize("guide", "admin"), create);
router.put("/:id", protect, update);
router.delete("/:id", protect, remove);

module.exports = router;
