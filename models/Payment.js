import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true }, // Ensure payments are linked to doctors
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true }, // Ensure payments are tied to appointments
    amount: { type: Number, required: true, min: 1 }, // Ensure amount is valid
    transactionId: { type: String, unique: true, required: true, index: true }, // Unique + Indexed for faster lookup
    paymentMethod: { 
      type: String, 
      enum: ["card", "upi", "netbanking", "paypal", "wallet"], 
      required: true 
    }, // Added more methods for flexibility
    status: { 
      type: String, 
      enum: ["success", "failed", "pending"], 
      default: "pending" 
    },
    isRefunded: { type: Boolean, default: false }, // Added to track refunds
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;
