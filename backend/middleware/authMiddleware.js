const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "The user for this token no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
      error: error.message,
      route: `${req.method} ${req.originalUrl}`,
    });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action.",
      requiredRoles: roles,
      currentRole: req.user?.role || null,
    });
  }

  next();
};

module.exports = {
  protect,
  requireRole,
};
