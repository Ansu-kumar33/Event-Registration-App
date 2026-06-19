const express = require("express");
const router = express.Router();
const {
  createRegistration,
  getMyRegistrations,
} = require("../controllers/registrationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/my-registrations", protect, getMyRegistrations);
router.post("/", protect, createRegistration);

module.exports = router;
