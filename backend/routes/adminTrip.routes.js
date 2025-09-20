import express from "express";

import {
  createTrip,
  getAllTrips,
  getTripById,
  updateTripStatus,
  recordOvercrowding,
  getOvercrowdingByDay,
} from "../controllers/trip.controller.js";
import { createBooking } from "../controllers/booking.controller.js";
import { getTripLocationHistory } from "../controllers/trip.controller.js";
import { verifyToken, admin } from "../middlewares/protectedRoutes.js";
// Record overcrowding event for a trip
tripRouter.post("/:id/overcrowding", verifyToken, admin, recordOvercrowding);
// Get overcrowding data by day
tripRouter.get(
  "/overcrowding/by-day",
  verifyToken,
  admin,
  getOvercrowdingByDay
);

// All routes are protected for Admin access
const tripRouter = express.Router();

tripRouter
  .route("/")
  .post(verifyToken, admin, createTrip)
  .get(verifyToken, admin, getAllTrips);

// Booking creation with coupon/discount
tripRouter.post("/book", verifyToken, createBooking);

tripRouter.route("/:id").get(verifyToken, admin, getTripById);
// Get location history for a trip

tripRouter
  .route("/:id/location-history")
  .get(verifyToken, admin, getTripLocationHistory);

tripRouter.route("/:id/status").put(verifyToken, admin, updateTripStatus);

export default tripRouter;
