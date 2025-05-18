import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: "whatsapp:+14155238886", // Twilio's official sandbox number
      to: `whatsapp:${to}`,
    });

    console.log("WhatsApp message sent:", response.sid);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
};
