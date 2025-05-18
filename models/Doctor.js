import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Links doctor to a user account
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: String, required: true }, // Could be a number instead of string (e.g., years of experience)
    hospitalName: { type: String }, // Made optional for freelance doctors
    phone: { type: String, required: true }, // Separating phone from email
    email: { type: String, required: true, unique: true }, // Email should be unique for doctors
    fees: { type: Number, required: true, min: 100 }, // Ensures minimum value
    availableSlots: [
      {
        date: { type: Date, required: true }, // Stores date of availability
        startTime: { type: String, required: true }, // Example: "10:00 AM"
        endTime: { type: String, required: true }, // Example: "12:00 PM"
        isBooked: { type: Boolean, default: false }, // Tracks if the slot is taken
      },
    ],
    isAvailable: { type: Boolean, default: true }, // Tracks doctor's availability status
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", DoctorSchema);
export default Doctor;
