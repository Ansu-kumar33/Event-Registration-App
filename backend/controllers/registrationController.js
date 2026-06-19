const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { sendRegistrationEmail } = require("../config/email");

const getErrorLocation = (error) => {
  const stackLines = error?.stack?.split("\n") || [];
  const locationLine = stackLines.find((line) => line.includes("\\backend\\"));

  return locationLine ? locationLine.trim() : "Location not available";
};

const findEventByIdentifier = async (eventId) => {
  const eventQuery = mongoose.Types.ObjectId.isValid(eventId)
    ? {
        $or: [{ _id: new mongoose.Types.ObjectId(eventId) }, { eventId }],
      }
    : { eventId };

  return Event.findOne(eventQuery);
};

const createRegistration = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        message: "eventId is required",
      });
    }

    const event = await findEventByIdentifier(eventId);

    if (!event) {
      return res.status(404).json({
        message: "The selected event could not be found. Please choose a valid event and try again.",
      });
    }

    const existingRegistration = await Registration.findOne({
      userId: req.user._id,
      eventId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: `You are already registered for ${event.title}.`,
      });
    }

    const savedRegistration = await Registration.create({
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      eventId,
    });

    try {
      await sendRegistrationEmail(req.user.name, req.user.email);

      res.status(201).json({
        message: `Registration successful for ${event.title}. Confirmation email sent.`,
        emailSent: true,
        eventTitle: event.title,
        registration: savedRegistration,
      });
    } catch (emailError) {
      console.error("Confirmation email failed:", emailError);
      console.error("File and line:", getErrorLocation(emailError));

      res.status(201).json({
        message: `Registration successful for ${event.title}, but the confirmation email could not be sent.`,
        emailError: emailError.message,
        emailSent: false,
        eventTitle: event.title,
        registration: savedRegistration,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    console.error("File and line:", getErrorLocation(error));
    res.status(500).json({ message: "Error saving registration", error: error.message });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user._id })
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    const validObjectIds = registrations
      .map((registration) => registration.eventId)
      .filter((eventId) => mongoose.Types.ObjectId.isValid(eventId))
      .map((eventId) => new mongoose.Types.ObjectId(eventId));

    const events = await Event.find({ _id: { $in: validObjectIds } }).lean();
    const eventsById = new Map(events.map((event) => [event._id.toString(), event]));

    const registrationsWithEvents = registrations.map((registration) => ({
      ...registration,
      event: eventsById.get(registration.eventId) || null,
    }));

    res.status(200).json(registrationsWithEvents);
  } catch (error) {
    console.error("Failed to load user registrations:", error);
    res.status(500).json({ message: "Failed to load registrations.", error: error.message });
  }
};

module.exports = {
  createRegistration,
  getMyRegistrations,
};
