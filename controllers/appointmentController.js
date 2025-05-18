import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import { sendWhatsAppNotification } from "./notificationController.js";

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime } = req.body;
    const patientId = req.user.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      startTime,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: "Selected time slot is already booked" });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      startTime,
      endTime,
      status: "confirmed",
      paymentStatus: "unpaid",
    });
const patient = await User.findById(patientId);
if (!patient || !patient.phone) {
  console.log("Patient phone number not found for:", patientId);
  return res.status(400).json({ success: false, message: "Patient phone number not found" });
}

try {
  const appointmentTime = new Date(`${date}T${startTime}`);
  await sendWhatsAppNotification(patient.phone, doctor.name, appointmentTime);
} catch (error) {
  console.error("Error sending WhatsApp notification:", error);
}


    res.status(201).json({ success: true, message: "Appointment booked successfully", appointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ success: false, message: "Booking failed" });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate("doctorId", "name specialization")
      .select("-__v");

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ success: false, message: "Failed to cancel appointment" });
  }
};
