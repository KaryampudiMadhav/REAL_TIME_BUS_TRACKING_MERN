// models/booking.model.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    // user_id is NOT required for offline bookings made by a conductor
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    booking_channel: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      required: true,
    },

    seat_numbers: {
      type: [String],
      required: true,
      default: [],
      description: "Array of seat numbers booked for this trip.",
    },
    // NEW: Array to store details for each passenger
    passengers: [{
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
      seatNumber: { type: String } // Optional, to link passenger to specific seat
    }],
    total_fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED_BY_USER", "CANCELLED_BY_ADMIN"],
      default: "CONFIRMED",
    },
    // payment_id is NOT required for offline cash sales
    payment_id: {
      type: String,
    },
    // --- NEW FIELD ADDED HERE ---
    refund: {
      refund_id: { type: String }, // The refund transaction ID from the payment gateway
      amount: { type: Number },
      status: { type: String, enum: ["PENDING", "PROCESSED", "FAILED"] },
      processed_at: { type: Date },
    },
    // Coupon applied to booking (if any)
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
