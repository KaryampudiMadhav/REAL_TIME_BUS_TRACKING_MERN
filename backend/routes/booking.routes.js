import express from "express";
import { verifyToken } from "../middlewares/protectedRoutes.js";
import {
  createBooking,
  cancelBooking,
  getUserBookings,
} from "../controllers/booking.controller.js";

const router = express.Router();

// Create a booking (user)
router.post("/create", verifyToken, createBooking);

// Cancel a booking (user)
router.post("/cancel/:id", verifyToken, cancelBooking);

// Get all bookings for a user
router.get("/user", verifyToken, getUserBookings);

export default router;
