const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, "..", ".env");
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
  console.error("Failed to load environment file for MongoDB config:", dotenvResult.error.message);
} else {
  console.log(`Environment variables loaded from ${envPath}`);
}

const buildMongoDiagnostics = (uri) => {
  const diagnostics = {
    envPath,
    hasMongoUri: Boolean(uri),
    rawLength: uri ? uri.length : 0,
    trimmedLength: uri ? uri.trim().length : 0,
    startsWithQuote: uri ? uri.startsWith('"') || uri.startsWith("'") : false,
    endsWithQuote: uri ? uri.endsWith('"') || uri.endsWith("'") : false,
    hasLeadingOrTrailingWhitespace: uri ? uri !== uri.trim() : false,
    containsCarriageReturn: uri ? uri.includes("\r") : false,
    containsLineBreak: uri ? /[\r\n]/.test(uri) : false,
    formatLooksValid: false,
    protocol: null,
    hostname: null,
    databaseName: null,
    username: null,
  };

  if (!uri) {
    return diagnostics;
  }

  const trimmedUri = uri.trim();

  try {
    const parsedUrl = new URL(trimmedUri);

    diagnostics.protocol = parsedUrl.protocol;
    diagnostics.hostname = parsedUrl.hostname;
    diagnostics.databaseName = parsedUrl.pathname.replace(/^\//, "") || "(not specified)";
    diagnostics.username = decodeURIComponent(parsedUrl.username || "");
    diagnostics.formatLooksValid =
      ["mongodb:", "mongodb+srv:"].includes(parsedUrl.protocol) &&
      Boolean(parsedUrl.hostname);
  } catch (error) {
    diagnostics.parseError = error.message;
  }

  return diagnostics;
};

const getMongoDiagnostics = () => buildMongoDiagnostics(process.env.MONGO_URI);

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const diagnostics = buildMongoDiagnostics(mongoUri);

  console.log("MongoDB connection diagnostics:", {
    envPath: diagnostics.envPath,
    hasMongoUri: diagnostics.hasMongoUri,
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
  });

  if (diagnostics.username) {
    console.log(`MongoDB username from MONGO_URI: ${diagnostics.username}`);
  } else {
    console.log("MongoDB username from MONGO_URI: (not present)");
  }

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured in backend/.env");
  }

  if (!diagnostics.formatLooksValid) {
    throw new Error(
      `MONGO_URI format is invalid${diagnostics.parseError ? `: ${diagnostics.parseError}` : ""}`
    );
  }

  try {
    console.log(`Attempting MongoDB connection to host ${diagnostics.hostname}...`);
    await mongoose.connect(mongoUri.trim());
    console.log(`MongoDB connected successfully to ${diagnostics.hostname}`);
  } catch (error) {
    console.error("MongoDB connection failed:", {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
    });
    throw error;
  }
};

module.exports = {
  connectDB,
  getMongoDiagnostics,
};
