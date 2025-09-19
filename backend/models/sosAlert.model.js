import mongoose from "mongoose";

const sosAlertSchema = new mongoose.Schema({
  trip_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  type: {
    type: String,
    enum: ["ACCIDENT", "MEDICAL", "SECURITY", "OTHER"],
    required: true,
  },
  message: { type: String },
  location: {
    latitude: Number,
    longitude: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

const SOSAlert = mongoose.model("SOSAlert", sosAlertSchema);
export default SOSAlert;
