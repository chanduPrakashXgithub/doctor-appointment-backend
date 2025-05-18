import Stripe from "stripe";
import dotenv from "dotenv";
import Payment from "../models/Payment.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import { sendWhatsAppNotification } from "./notificationController.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const processPayment = async (req, res) => {
  try {
    const { paymentMethodId, appointmentId, doctorId } = req.body;

    if (!req.user?.id || !appointmentId || !doctorId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const amount = 1; // ₹1 test
    const currency = "inr";

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      payment_method: paymentMethodId,
      confirm: true,
    });

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    const payment = new Payment({
      userId: req.user.id,
      doctorId,
      appointmentId,
      amount,
      currency,
      transactionId: paymentIntent.id,
      paymentMethod: "card",
      status: "success",
    });

    await payment.save();

    const appointment = await Appointment.findById(appointmentId);
    if (appointment) {
      appointment.paymentStatus = "paid";
      await appointment.save();
    }

    const user = await User.findById(req.user.id);
    const doctor = await Doctor.findById(doctorId);

    const appointmentTime = new Date(`${appointment.date.toISOString().split("T")[0]}T${appointment.startTime}`);
    if (user?.phone && doctor?.name) {
      await sendWhatsAppNotification(user.phone, doctor.name, appointmentTime);
    }

    res.json({ success: true, message: "Payment successful", paymentIntent });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ success: false, message: "Payment failed", error: error.message });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { appointmentId, doctorId, amount } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'upi'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Doctor Appointment Fee',
            },
            unit_amount: amount * 100, // ₹ to paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/confirmation`,
      cancel_url: `http://localhost:5173/checkout?cancelled=true`,
      metadata: {
        userId: req.user.id,
        doctorId,
        appointmentId,
      },
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    res.status(500).json({ success: false, message: "Checkout session failed", error: error.message });
  }
};

// 🔁 Get history
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve payments" });
  }
};
