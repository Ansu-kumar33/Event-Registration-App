const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const buildErrorPayload = (message, error, extra = {}) => {
  const payload = {
    success: false,
    message,
    error: error?.message || message,
    ...extra,
  };

  if (process.env.NODE_ENV !== "production" && error?.stack) {
    payload.stack = error.stack;
  }

  return payload;
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in process.env.JWT_SECRET");
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
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
        missingFields: ["name", "email", "password"].filter((field) => !req.body?.[field]),
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
        email: normalizedEmail,
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "user",
    });

    res.status(201).json({
      success: true,
      message: "Signup successful. You can now log in.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(
      buildErrorPayload("Failed to create account.", error, {
        route: "POST /api/auth/signup",
      })
    );
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
        missingFields: ["email", "password"].filter((field) => !req.body?.[field]),
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        email: normalizedEmail,
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        email: normalizedEmail,
      });
    }

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(
      buildErrorPayload("Failed to log in.", error, {
        route: "POST /api/auth/login",
      })
    );
  }
};

const getCurrentUser = async (req, res) => {
  res.status(200).json({ success: true, user: sanitizeUser(req.user) });
};

const testAuthRoute = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth routes working",
  });
};

module.exports = {
  signup,
  login,
  getCurrentUser,
  testAuthRoute,
};
