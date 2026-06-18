const express = require("express");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

console.log("Dashboard routes loaded");

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Dashboard API hit");
  console.log("GET /api/dashboard request received");

  try {
    const [totalEvents, totalRegistrations, recentEvents, recentRegistrations] = await Promise.all([
      Event.countDocuments(),
      Registration.countDocuments(),
      Event.find().sort({ createdAt: -1, _id: -1 }).limit(5),
      Registration.find().sort({ createdAt: -1, _id: -1 }).limit(5),
    ]);

    const dashboardData = {
      totalEvents,
      totalRegistrations,
      recentEvents,
      recentRegistrations,
    };

    console.log("Dashboard data prepared successfully:", dashboardData);

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("GET /api/dashboard failed:", error);
    res.status(500).json({
      message: "Error loading dashboard data",
      error: error.message,
    });
  }
});

module.exports = router;
