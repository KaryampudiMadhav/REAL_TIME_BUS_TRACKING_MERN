import express from "express";

import {
  createIssueReport,
  getMyTrips,
  getTripPassengers,
  getMyNotifications,
  getMyTripHistory,
  updateTripStatus,
  sendSOSAlert,
  verifyBookingQR,
} from "../controllers/conductor.controller.js";
import { respondToAssignment } from "../controllers/trip.controller.js";

const conductorRouter = express.Router();

import { staffConductorDriver } from "./../middlewares/protectedRoutes.js";
import { createOfflineBooking } from "./../controllers/conductor.controller.js";

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

conductorRouter.post(
  "/trip/:tripId/status",
  staffConductorDriver,
  verifyBookingQR
);

conductorRouter.post(
  "/bookings/offline",
  staffConductorDriver,
  createOfflineBooking
);
conductorRouter.get(
  "/verify-booking/:bookingId",
  staffConductorDriver,
  verifyBookingQR
);

// verifyBookingQR removed

conductorRouter.put(
  "/trip/:tripId/assignment",
  staffConductorDriver,
  respondToAssignment
);

export default conductorRouter;
