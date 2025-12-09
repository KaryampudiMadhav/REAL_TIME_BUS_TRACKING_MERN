import express from "express";
import { staffConductorDriver } from "../middlewares/protectedRoutes.js";
import { getMyTrips, updateTripStatus } from "../controllers/conductor.controller.js"; // Reusing conductor controller logic for common staff tasks? 
// Actually, let's check if we need a driver controller or can reuse. 
// Driver mostly needs: MyAssignedTrips, Accept/Reject, Start/End.
// `getMyTrips` in conductor controller filters by `conductor_id` or `driver_id`?
// Let's create a driver controller or ensure conductor one works for both.
// Checking `conductor.controller.js` next. For now, referencing trip controller for shared logic.
import { respondToAssignment, updateTripStatus as updateTripStatusCommon } from "../controllers/trip.controller.js";

const driverRouter = express.Router();

// Get My Trips
// We need a specific controller that looks for `driver_id` = req.staffId
// For now, I'll assume we need to add `getMyDriverTrips` to conductor controller or trip controller. 
// Let's use `trip.controller.js` for generic "getMyTrips" if possible, or creating new driver controller.
// Creating a simple driver controller might be cleaner.

import { getMyDriverTrips } from "../controllers/driver.controller.js";

driverRouter.get("/my-trips", staffConductorDriver, getMyDriverTrips);

// Response to assignment (Accept/Reject)
driverRouter.put("/trip/:tripId/assignment", staffConductorDriver, respondToAssignment);

// Start/End Trip
driverRouter.put("/trip/:tripId/status", staffConductorDriver, updateTripStatusCommon);

export default driverRouter;
