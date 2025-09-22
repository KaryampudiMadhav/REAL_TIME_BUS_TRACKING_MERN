// models/depot.model.js
import mongoose from "mongoose";

const depotSchema = new mongoose.Schema(
  {
    // The official name of the depot.
    name: {
      type: String,
      required: true,
      unique: true,
    },

    // Location details.
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },

    // GeoJSON for mapping the depot's exact location.
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // Contact information for the depot.
    contact_info: {
      phone: String,
      email: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for geospatial queries (e.g., "find nearest depot").
depotSchema.index({ location: "2dsphere" });

const Depot = mongoose.models.Depot || mongoose.model("Depot", depotSchema);
export default Depot;
