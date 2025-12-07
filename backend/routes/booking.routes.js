import express from "express";
const bookingRouter = express.Router();
import {
  getSeatAvailability,
  calculateFare,
  createOnlineBooking,
  cancelBooking,
  getMyBookings,
} from "../controllers/booking.controller.js";
import { verifyToken } from "../middlewares/protectedRoutes.js";

// --- Public route to check seat availability ---
bookingRouter.get("/availability/:tripId", getSeatAvailability);

// --- Protected routes for logged-in users ---
bookingRouter.post("/calculate-fare", verifyToken, calculateFare); // To get fare before final booking
bookingRouter.post("/", verifyToken, createOnlineBooking); // Main booking creation
bookingRouter.put("/:id/cancel", verifyToken, cancelBooking); // Cancel a specific booking
bookingRouter.get("/mybookings", verifyToken, getMyBookings); // Get all bookings for the user

export default bookingRouter;
