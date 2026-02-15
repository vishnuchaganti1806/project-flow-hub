const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { getAll, create, remove, assignGuide } = require("../controllers/teamController");

router.get("/", protect, getAll);
router.post("/", protect, create);
router.delete("/:id", protect, authorize("admin"), remove);
router.patch("/:id/guide", protect, authorize("admin"), assignGuide);

module.exports = router;
