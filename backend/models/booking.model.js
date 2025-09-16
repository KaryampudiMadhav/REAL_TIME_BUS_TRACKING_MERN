// models/booking.model.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // --- Links to other models ---
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- Booking Details ---
    seat_numbers: {
      type: [String],
      required: true,
    },
    total_fare: {
      type: Number,
      required: true,
    },

    // --- Status & Payment Details ---
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED_BY_USER", "CANCELLED_BY_ADMIN"],
      default: "CONFIRMED",
    },

    payment_id: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
