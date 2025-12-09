import express from "express";

import {
  createTrip,
  getAllTrips,
  getTripById,
  updateTripStatus,
  recordOvercrowding,
  getOvercrowdingByDay,
  updateTrip,
} from "../controllers/trip.controller.js";
import { getTripLocationHistory } from "../controllers/trip.controller.js";
import { staffAdmin } from "../middlewares/protectedRoutes.js";

const tripRouter = express.Router();

tripRouter.post("/:id/overcrowding", staffAdmin, recordOvercrowding);

tripRouter.get("/overcrowding/by-day", staffAdmin, getOvercrowdingByDay);

tripRouter.route("/").post(staffAdmin, createTrip).get(staffAdmin, getAllTrips);

tripRouter.route("/:id").get(staffAdmin, getTripById);
// Get location history for a trip

tripRouter
  .route("/:id/location-history")
  .get(staffAdmin, getTripLocationHistory);

tripRouter.route("/:id/status").put(staffAdmin, updateTripStatus);
tripRouter.route("/:id").put(staffAdmin, updateTrip);

export default tripRouter;
