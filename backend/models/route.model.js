// models/route.model.js
import mongoose from "mongoose";

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },

  longitude: {
    type: Number,
    required: true,
  },
  // The scheduled arrival time in minutes from the route's start time.
  arrival_offset_mins: {
    type: Number,
    required: true,
  },
  departure_offset_mins: {
    type: Number,
    required: true,
  },
});

const routeSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: true,
      unique: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    stops: [stopSchema],
    distance_km: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Route = mongoose.model("Route", routeSchema);
export default Route;
