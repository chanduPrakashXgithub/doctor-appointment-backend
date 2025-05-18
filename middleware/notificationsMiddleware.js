import nodemailer from "nodemailer";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Twilio Client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Nodemailer Transporter (Use OAuth2 for better security)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Consider using OAuth2 instead of plain password
  },
});

// WhatsApp Notification Middleware
export const sendWhatsAppNotification = async (req, res) => {
  try {
    const { to, message } = req.body;

    const response = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER, // Use env variable
      to: `whatsapp:${to}`,
    });

    console.log("WhatsApp Notification Sent:", response.sid);
    res.status(200).json({ success: true, message: "WhatsApp notification sent" });
  } catch (error) {
    console.error("WhatsApp Notification Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send WhatsApp notification" });
  }
};

// Email Notification Middleware
export const sendEmailNotification = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
    });

    console.log("Email Notification Sent to:", to);
    res.status(200).json({ success: true, message: "Email notification sent" });
  } catch (error) {
    console.error("Email Notification Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send email notification" });
  }
};
