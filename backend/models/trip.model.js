// models/trip.model.js
import mongoose from "mongoose";

const visitedStopSchema = new mongoose.Schema({
  stop_name: { type: String },
  actual_arrival_time: { type: Date },
  actual_departure_time: { type: Date },
});

const tripSchema = new mongoose.Schema(
  {
    // --- Links to other models (remain the same) ---
    route_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    conductor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },

    // --- STAFF STATUS ---
    driver_status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING"
    },
    conductor_status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING"
    },

    // --- Trip Schedule & Status (remain the same) ---
    departure_datetime: { type: Date, required: true },
    arrival_datetime: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ["SCHEDULED", "IN_TRANSIT", "COMPLETED", "CANCELLED", "DELAYED"],
      default: "SCHEDULED",
    },

    // --- NEW FIELDS FOR SEAT MANAGEMENT ---
    seat_allocation: {
      online: { type: Number, required: true },
      offline: { type: Number, required: true },
    },
    tickets_booked: {
      online: { type: Number, default: 0 },
      offline: { type: Number, default: 0 },
    },
    // Array of all reserved seat numbers for this trip
    booked_seats: {
      type: [String],
      default: [],
      description: "All seat numbers reserved for this trip.",
    },
    // Temporary seat holds during booking process
    held_seats: [
      {
        seat_numbers: [String],
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        expires_at: {
          type: Date,
          required: true,
        },
      },
    ],

    // --- Real-Time Data (remain the same) ---
    live_location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    last_location_update: { type: Date },
    // Array of { latitude, longitude, timestamp }
    location_history: [
      {
        latitude: { type: Number },
        longitude: { type: Number },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    visited_stops: [visitedStopSchema],
    // Overcrowding events: { date, passengerCount }
    overcrowdingEvents: [
      {
        date: { type: Date, required: true },
        passengerCount: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
