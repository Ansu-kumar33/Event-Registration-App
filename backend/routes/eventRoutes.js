const express = require("express");
const router = express.Router();
const {
  listEvents,
  searchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { protect, requireRole } = require("../middleware/authMiddleware");

router.get("/", listEvents);
router.get("/search", searchEvents);
router.post("/", protect, requireRole("admin"), createEvent);
router.put("/:id", protect, requireRole("admin"), updateEvent);
router.delete("/:id", protect, requireRole("admin"), deleteEvent);

module.exports = router;
