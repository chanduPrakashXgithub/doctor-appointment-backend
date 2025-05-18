import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendWhatsAppNotification = async (to, doctorName, appointmentTime) => {
  try {
    const formattedTime = new Date(appointmentTime).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const message = `Hello! Your appointment with Dr. ${doctorName} is confirmed on ${formattedTime}. Please be on time.`;

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER, // Twilio's WhatsApp Number
      to: `whatsapp:${to}`, // Patient's WhatsApp Number
    });

    console.log("WhatsApp message sent:", response.sid);
    return { success: true, message: "Notification sent successfully" };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw new Error("Failed to send notification"); // 🔥 Explicit Error
  }
};

export const notifyPatient = async (req, res) => {
  try {
    const { to, doctorName, appointmentTime } = req.body;

    if (!to || !doctorName || !appointmentTime) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const result = await sendWhatsAppNotification(to, doctorName, appointmentTime);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Notification failed", error: error.message });
  }
};
