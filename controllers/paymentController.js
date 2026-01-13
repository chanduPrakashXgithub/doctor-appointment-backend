import Stripe from "stripe";
import dotenv from "dotenv";
import Payment from "../models/Payment.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import { sendWhatsAppNotification } from "./notificationController.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const processPayment = async (req, res) => {
  try {
    const { paymentMethodId, appointmentId, doctorId } = req.body;

    if (!req.user?.id || !appointmentId || !doctorId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Get doctor fees
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const amount = doctor.fees || 500; // Use doctor's fees or default
    const currency = "inr";

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to paise
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
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

    // Get doctor info for better checkout experience
    const doctor = await Doctor.findById(doctorId);
    const productName = doctor
      ? `Appointment with Dr. ${doctor.name}`
      : "Doctor Appointment Fee";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: productName,
              description: `Consultation fee for medical appointment`,
            },
            unit_amount: (amount || 500) * 100, // ₹ to paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout?cancelled=true`,
      metadata: {
        userId: req.user.id,
        doctorId,
        appointmentId,
      },
      customer_email: req.user.email,
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
