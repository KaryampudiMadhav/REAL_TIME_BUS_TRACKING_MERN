// models/trip.model.js
import mongoose from "mongoose";

// A sub-schema to record the actual time a bus reaches/leaves a stop during a live trip.
const visitedStopSchema = new mongoose.Schema({
  stop_name: { type: String },
  actual_arrival_time: { type: Date },
  actual_departure_time: { type: Date },
});

const tripSchema = new mongoose.Schema(
  {
    // --- Links to other "blueprint" models ---
    route_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route", // Link to the Route model
      required: true,
    },
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle", // Link to the specific bus being used
      required: true,
    },
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // Link to the assigned driver
      required: true,
    },
    conductor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // Link to the assigned conductor
    },

    // --- Trip Schedule & Status ---
    departure_datetime: {
      type: Date,
      required: true, // The scheduled start time for this specific trip
    },
    arrival_datetime: {
      type: Date, // The scheduled end time, calculated from departure + route duration
    },
    status: {
      type: String,
      required: true,
      enum: ["SCHEDULED", "IN_TRANSIT", "COMPLETED", "CANCELLED", "DELAYED"],
      default: "SCHEDULED",
    },

    // --- Real-Time & Dynamic Data ---
    live_location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    last_location_update: {
      type: Date, // Crucial for your automated alert system
    },
    current_passenger_count: {
      type: Number, // Updated from bookings, for the Municipal dashboard
      default: 0,
    },
    // This array gets populated as the bus visits each stop.
    visited_stops: [visitedStopSchema],
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
