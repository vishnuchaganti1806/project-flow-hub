const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { getAll, create, reply, resolve } = require("../controllers/doubtController");

router.get("/", protect, getAll);
router.post("/", protect, create);
router.post("/:id/reply", protect, reply);
router.patch("/:id/resolve", protect, resolve);

module.exports = router;
