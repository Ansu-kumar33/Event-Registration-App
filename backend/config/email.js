const nodemailer = require("nodemailer");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

let transporter;

const getErrorLocation = (error) => {
  const stackLines = error?.stack?.split("\n") || [];
  const locationLine = stackLines.find((line) => line.includes("\\backend\\"));

  return locationLine ? locationLine.trim() : "Location not available";
};

const createEmailTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be configured in backend/.env");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return transporter;
};

const sendRegistrationEmail = async (name, email) => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const mailTransporter = createEmailTransporter();

  const mailOptions = {
    from: `"Event Registration System" <${emailUser}>`,
    to: email,
    subject: "Event Registration Successful",
    text: `Hello ${name},

You have successfully registered for the event.

Thank you for registering.`,
  };

  try {
    console.log("Sending email...");
    const info = await mailTransporter.sendMail(mailOptions);
    console.log("Email sent successfully", info.response);
    return info;
  } catch (error) {
    console.error("Email sending failed");
    console.error("Reason:", error.message);
    console.error("File and line:", getErrorLocation(error));
    throw error;
  }
};

module.exports = { sendRegistrationEmail };
