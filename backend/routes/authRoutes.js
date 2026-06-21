const express = require("express");
const router = express.Router();
const { signup, login, getCurrentUser, testAuthRoute } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.get("/test", testAuthRoute);
router.post("/signup", signup);
router.post("/register", signup);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);

module.exports = router;
