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

    // --- FIELD TO TRACK THE CHANNEL ---
    booking_channel: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      required: true,
    },

    seat_numbers: {
      type: [String],
      required: true,
    },
    total_fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
    // payment_id is NOT required for offline cash sales
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
