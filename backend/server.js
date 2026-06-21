const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");

const envPath = path.join(__dirname, ".env");
const hasLocalEnvFile = fs.existsSync(envPath);
const dotenvResult = hasLocalEnvFile ? dotenv.config({ path: envPath }) : { error: null };

if (hasLocalEnvFile && dotenvResult.error) {
  console.error(dotenvResult.error);
} else {
  console.log(
    hasLocalEnvFile
      ? `backend/.env loaded from ${envPath}`
      : "backend/.env not found. Using environment variables provided by the host."
  );
}

const authRoutes = require("./routes/authRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { connectDB, getMongoDiagnostics } = require("./config/db");

const app = express();
const registeredRoutes = [];
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_ORIGIN,
].filter(Boolean));

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin) || /https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const registerRoutes = (basePath, router) => {
  registeredRoutes.push(`USE ${basePath}`);

  if (!router?.stack) {
    return;
  }

  router.stack.forEach((layer) => {
    if (!layer.route) {
      return;
    }

    const methods = Object.keys(layer.route.methods)
      .map((method) => method.toUpperCase())
      .join(", ");

    registeredRoutes.push(`${methods} ${basePath}${layer.route.path}`);
  });
};

const printRegisteredRoutes = () => {
  console.log("Registered Express routes:");
  console.log("OPTIONS /*");
  console.log("GET /");
  registeredRoutes.forEach((route) => console.log(route));
};

// Middleware
app.use(
  cors(corsOptions)
);
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// Routes
registerRoutes("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
const eventRoutes = require("./routes/eventRoutes");
registerRoutes("/api/events", eventRoutes);
app.use("/api/events", eventRoutes);
console.log("Mounted /api/events route");
registerRoutes("/api/register", registrationRoutes);
app.use("/api/register", registrationRoutes);
registerRoutes("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Server Running");
});

app.get("/api/db-status", (req, res) => {
  const diagnostics = getMongoDiagnostics();
  const readyStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    dotenvLoaded: !dotenvResult.error,
    envPath,
    mongoUriLoaded: diagnostics.hasMongoUri,
    mongooseReadyState: mongoose.connection.readyState,
    mongooseReadyStateLabel: readyStateMap[mongoose.connection.readyState] || "unknown",
    diagnostics: {
      rawLength: diagnostics.rawLength,
      trimmedLength: diagnostics.trimmedLength,
      hasLeadingOrTrailingWhitespace: diagnostics.hasLeadingOrTrailingWhitespace,
      startsWithQuote: diagnostics.startsWithQuote,
      endsWithQuote: diagnostics.endsWithQuote,
      containsCarriageReturn: diagnostics.containsCarriageReturn,
      containsLineBreak: diagnostics.containsLineBreak,
      formatLooksValid: diagnostics.formatLooksValid,
      protocol: diagnostics.protocol,
      hostname: diagnostics.hostname,
      databaseName: diagnostics.databaseName,
      username: diagnostics.username || null,
      parseError: diagnostics.parseError || null,
    },
  });
});

app.use((error, req, res, next) => {
  if (!error) {
    return next();
  }

  console.error(error);

  if (error.message?.startsWith("CORS blocked for origin:")) {
    return res.status(403).json({
      success: false,
      message: "CORS request blocked.",
      error: error.message,
      route: `${req.method} ${req.originalUrl}`,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Unexpected server error.",
    error: error.message,
    route: `${req.method} ${req.originalUrl}`,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      printRegisteredRoutes();
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
