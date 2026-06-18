const express = require("express");
const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { sendRegistrationEmail } = require("../config/email");

const router = express.Router();

const getErrorLocation = (error) => {
  const stackLines = error?.stack?.split("\n") || [];
  const locationLine = stackLines.find((line) => line.includes("\\backend\\"));

  return locationLine ? locationLine.trim() : "Location not available";
};

router.post("/", async (req, res) => {
  try {
    console.log("REGISTRATION REQUEST RECEIVED");
    console.log(req.body);

    const { name, email, eventId } = req.body;

    console.log("Parsed registration fields:", { name, email, eventId });

    if (!name || !email || !eventId) {
      return res.status(400).json({
        message: "Name, email, and eventId are required",
      });
    }

    console.log("Event ID received from frontend:", eventId);

    const eventQuery = mongoose.Types.ObjectId.isValid(eventId)
      ? {
          $or: [
            { _id: new mongoose.Types.ObjectId(eventId) },
            { eventId },
          ],
        }
      : { eventId };

    console.log("MongoDB query used:", eventQuery);

    const event = await Event.findOne(eventQuery);

    console.log("Event.findById()/lookup returned null:", event === null);

    if (!event) {
      return res.status(404).json({
        message: "The selected event could not be found. Please choose a valid event and try again.",
      });
    }

    console.log("EVENT FOUND");
    console.log("Event found for registration:", event);

    const registration = new Registration({
      name,
      email,
      eventId,
    });

    console.log("BEFORE SAVE");
    const savedRegistration = await registration.save();

    console.log("AFTER SAVE");
    console.log(savedRegistration);

    try {
      await sendRegistrationEmail(name, email);
      console.log("EMAIL SENT");
      console.log("Email sent successfully");
      console.log("Confirmation email sent successfully to:", email);

      res.status(201).json({
        message: `Registration successful for ${event.title}. Confirmation email sent.`,
        emailSent: true,
        eventTitle: event.title,
        registration: savedRegistration,
      });
    } catch (emailError) {
      console.error("Email sending failed");
      console.error("Reason:", emailError.message);
      console.error("File and line:", getErrorLocation(emailError));
      console.error("Confirmation email failed:", emailError);

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
    console.error("Reason:", error.message);
    console.error("File and line:", getErrorLocation(error));
    res.status(500).json({ message: "Error saving registration", error: error.message });
  }
});

module.exports = router;
