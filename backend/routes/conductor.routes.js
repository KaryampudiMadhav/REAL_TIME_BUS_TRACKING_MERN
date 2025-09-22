import express from "express";

import {
  createIssueReport,
  getMyTrips,
  getTripPassengers,
  getMyNotifications,
  getMyTripHistory,
  updateTripStatus,
  sendSOSAlert,
} from "../controllers/conductor.controller.js";

const conductorRouter = express.Router();

import { staffConductorDriver } from "./../middlewares/protectedRoutes.js";

conductorRouter.post("/sos", staffConductorDriver, sendSOSAlert);
// ... other driver routes
conductorRouter.post("/issues", staffConductorDriver, createIssueReport);
// Trip dashboard
conductorRouter.get("/my-trips", staffConductorDriver, getMyTrips);
// Passenger management
conductorRouter.get(
  "/trip/:tripId/passengers",
  staffConductorDriver,
  getTripPassengers
);
// Notifications
conductorRouter.get("/notifications", staffConductorDriver, getMyNotifications);
// Trip history
conductorRouter.get("/my-trip-history", staffConductorDriver, getMyTripHistory);
// End trip / update status
conductorRouter.put(
  "/trip/:tripId/status",
  staffConductorDriver,
  updateTripStatus
);

export default conductorRouter;
