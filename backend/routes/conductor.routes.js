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
import { verifyToken } from "./../middlewares/protectedRoutes.js";

// ... other driver routes
conductorRouter.post("/issues", verifyToken, createIssueReport);
// Trip dashboard
conductorRouter.get("/my-trips", verifyToken, getMyTrips);
// Passenger management
conductorRouter.get("/trip/:tripId/passengers", verifyToken, getTripPassengers);
// Notifications
conductorRouter.get("/notifications", verifyToken, getMyNotifications);
// Trip history
conductorRouter.get("/my-trip-history", verifyToken, getMyTripHistory);
// End trip / update status
conductorRouter.put("/trip/:tripId/status", verifyToken, updateTripStatus);

export default conductorRouter;
