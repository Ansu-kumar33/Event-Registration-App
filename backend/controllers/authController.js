const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in backend/.env");
  }

  return process.env.JWT_SECRET;
};

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, getJwtSecret(), {
    expiresIn: "1d",
  });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    res.status(201).json({
      message: "Signup successful. You can now log in.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("POST /api/auth/signup failed:", error);
    res.status(500).json({ message: "Failed to create account.", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    res.status(500).json({ message: "Failed to log in.", error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  res.status(200).json({ user: sanitizeUser(req.user) });
};

module.exports = {
  signup,
  login,
  getCurrentUser,
};
