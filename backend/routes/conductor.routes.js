import express from "express";
const conductorRouter = express.Router();

import {
  createIssueReport,
  getMyTrips,
  getTripPassengers,
  getMyNotifications,
  getMyTripHistory,
  updateTripStatus,
  sendSOSAlert,
} from "../controllers/conductor.controller.js";
// SOS alert
conductorRouter.post("/sos", verifyToken, sendSOSAlert);
import { verifyToken, conductor } from "./../middlewares/protectedRoutes.js";

// ... other driver routes
conductorRouter.post("/issues", verifyToken, conductor, createIssueReport);
// Trip dashboard
conductorRouter.get("/my-trips", verifyToken, conductor, getMyTrips);
// Passenger management
conductorRouter.get(
  "/trip/:tripId/passengers",
  verifyToken,
  conductor,
  getTripPassengers
);
// Notifications
conductorRouter.get(
  "/notifications",
  verifyToken,
  conductor,
  getMyNotifications()
);
// Trip history
conductorRouter.get(
  "/my-trip-history",
  verifyToken,
  conductor,
  getMyTripHistory()
);
// End trip / update status
conductorRouter.put(
  "/trip/:tripId/status",
  verifyToken,
  conductor,
  updateTripStatus
);

export default conductorRouter;
