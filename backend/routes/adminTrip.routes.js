import express from "express";

import {
  createTrip,
  getAllTrips,
  getTripById,
  updateTripStatus,
} from "../controllers/trip.controller.js";
import { verifyToken, admin } from "../middlewares/protectedRoutes.js";
// All routes are protected for Admin access
const tripRouter = express.Router();
tripRouter
  .route("/")
  .post(verifyToken, admin, createTrip)
  .get(verifyToken, admin, getAllTrips);

tripRouter.route("/:id").get(verifyToken, admin, getTripById);
// Get location history for a trip
import { getTripLocationHistory } from "../controllers/trip.controller.js";
tripRouter.route("/:id/location-history").get(verifyToken, admin, getTripLocationHistory);

tripRouter.route("/:id/status").put(verifyToken, admin, updateTripStatus);

export default tripRouter;
