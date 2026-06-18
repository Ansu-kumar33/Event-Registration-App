const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  console.log("POST /api/auth/register request received");
  console.log("POST /api/auth/register req.body:", req.body);

  try {
    const { name, email, password } = req.body;

    console.log("POST /api/auth/register parsed fields:", { name, email, password });

    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    console.log("POST /api/auth/register user saved successfully");

    res.send("User Registered Successfully");
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    res.status(500).send("Error");
  }
});

module.exports = router;
