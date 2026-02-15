const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const { getAll, getById, create, update, updateStatus, remove } = require("../controllers/ideaController");

router.get("/", protect, getAll);
router.get("/:id", protect, getById);
router.post("/", protect, authorize("student"), upload.array("attachments", 5), create);
router.put("/:id", protect, update);
router.patch("/:id/status", protect, authorize("guide", "admin"), updateStatus);
router.delete("/:id", protect, authorize("student"), remove);

module.exports = router;
