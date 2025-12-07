// models/vehicle.model.js
import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    // --- Primary Identifier ---
    // The official registration number of the bus (license plate).
    bus_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // --- Bus Specifications ---
    service_type: {
      type: String,
      required: true,
      enum: [
        "Palle Velugu",
        "Express",
        "Ultra Deluxe",
        "Super Luxury",
        "Indra AC",
        "Garuda Plus",
        "Amaravati",
        "Rajdhani",
        "Vajra"
      ],
    },
    total_seats: {
      type: Number,
      required: true,
    },
    amenities: {
      type: [String], // An array of features like "AC", "WiFi", "Charging Ports"
      default: [],
    },

    // --- Operational Details ---
    depot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Depot", // Links the vehicle to its home depot
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["AVAILABLE", "ON_TRIP", "IN_MAINTENANCE", "OUT_OF_SERVICE"],
      default: "AVAILABLE",
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
