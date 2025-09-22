import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trip_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
  seat_number: {
    type: String,
    required: true,
  },
  fare: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "CANCELLED", "REFUNDED"],
    default: "ACTIVE",
  },
  issued_at: {
    type: Date,
    default: Date.now,
  },
  refund: {
    refund_id: { type: String },
    amount: { type: Number },
    status: { type: String, enum: ["PENDING", "PROCESSED", "FAILED"] },
    processed_at: { type: Date },
  },
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
