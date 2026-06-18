const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("GET /api/events request received");

  try {
    const events = await Event.find().sort({ date: 1 });

    console.log(`GET /api/events returned ${events.length} event(s)`);

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
});

router.get("/search", async (req, res) => {
  console.log("GET /api/events/search request received");
  console.log("GET /api/events/search query:", req.query);

  try {
    const title = req.query.title || "";

    const matchingEvents = await Event.find({
      title: {
        $regex: title,
        $options: "i",
      },
    }).sort({ date: 1 });

    console.log(`GET /api/events/search returned ${matchingEvents.length} event(s)`);

    res.status(200).json(matchingEvents);
  } catch (error) {
    console.error("Error searching events:", error);
    res.status(500).json({ message: "Error searching events", error: error.message });
  }
});

router.post("/", async (req, res) => {
  console.log("POST /api/events request received");
  console.log("POST /api/events req.body:", req.body);

  try {
    const { title, description, date, location } = req.body;

    console.log("POST /api/events parsed fields:", { title, description, date, location });

    if (!title || !description || !date || !location) {
      return res.status(400).json({
        message: "Title, description, date, and location are required.",
      });
    }

    const event = new Event({
      title,
      description,
      date,
      location,
    });

    const savedEvent = await event.save();

    console.log("POST /api/events saved event:", savedEvent);

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error saving event:", error);
    res.status(500).json({ message: "Error saving event", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  console.log("PUT /api/events/:id request received");
  console.log("PUT /api/events/:id params:", req.params);
  console.log("PUT /api/events/:id req.body:", req.body);

  try {
    const { title, description, date, location } = req.body;

    console.log("PUT /api/events/:id parsed fields:", { title, description, date, location });

    if (!title || !description || !date || !location) {
      return res.status(400).json({
        message: "Title, description, date, and location are required.",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        date,
        location,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedEvent) {
      console.log("PUT /api/events/:id no event found for id:", req.params.id);
      return res.status(404).json({ message: "Event not found" });
    }

    console.log("PUT /api/events/:id updated event:", updatedEvent);

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  console.log("DELETE /api/events/:id request received");
  console.log("DELETE /api/events/:id params:", req.params);

  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      console.log("DELETE /api/events/:id no event found for id:", req.params.id);
      return res.status(404).json({ message: "Event not found" });
    }

    console.log("DELETE /api/events/:id deleted event:", deletedEvent);

    res.status(200).json({ message: "Event deleted successfully", deletedEvent });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event", error: error.message });
  }
});

module.exports = router;
