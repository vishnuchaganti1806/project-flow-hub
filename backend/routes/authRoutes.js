const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validationMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { register, login, getMe } = require("../controllers/authController");

router.post("/register", [
  body("name").trim().notEmpty(), body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }), body("role").isIn(["student", "guide"]),
], validate, register);

router.post("/login", [
  body("email").isEmail().normalizeEmail(), body("password").notEmpty(),
], validate, login);

router.get("/me", protect, getMe);

module.exports = router;
