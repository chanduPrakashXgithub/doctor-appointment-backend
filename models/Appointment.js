import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true }, // Stores only the date
    startTime: { type: String, required: true }, // Example: "10:00 AM"
    endTime: { type: String, required: true }, // Example: "10:30 AM"
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: false }, // Links to payment details
    isBooked: { type: Boolean, default: false }, // Tracks if the slot is taken
    notes: { type: String }, // Optional: Symptoms or other details
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", AppointmentSchema);
export default Appointment;
