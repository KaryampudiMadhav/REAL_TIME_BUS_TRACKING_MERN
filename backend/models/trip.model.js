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
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
