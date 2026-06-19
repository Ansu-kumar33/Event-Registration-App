const Event = require("../models/Event");

const listEvents = async (req, res) => {
  console.log("GET /api/events request received");

  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};

const searchEvents = async (req, res) => {
  console.log("GET /api/events/search request received");

  try {
    const title = req.query.title || "";
    const matchingEvents = await Event.find({
      title: {
        $regex: title,
        $options: "i",
      },
    }).sort({ date: 1 });

    res.status(200).json(matchingEvents);
  } catch (error) {
    console.error("Error searching events:", error);
    res.status(500).json({ message: "Error searching events", error: error.message });
  }
};

const createEvent = async (req, res) => {
  console.log("POST /api/events request received");

  try {
    const { title, description, date, location } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({
        message: "Title, description, date, and location are required.",
      });
    }

    const savedEvent = await Event.create({
      title,
      description,
      date,
      location,
    });

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error saving event:", error);
    res.status(500).json({ message: "Error saving event", error: error.message });
  }
};

const updateEvent = async (req, res) => {
  console.log("PUT /api/events/:id request received");

  try {
    const { title, description, date, location } = req.body;

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
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  console.log("DELETE /api/events/:id request received");

  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully", deletedEvent });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event", error: error.message });
  }
};

module.exports = {
  listEvents,
  searchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
