import express from "express";
import { getTripById } from "../controllers/trip.controller.js";

const passengerRouter = express.Router();

// Public route to get trip details (including route stops)
passengerRouter.get("/:id", getTripById);

export default passengerRouter;
