import Trip from "../models/trip.model.js";
import { respondToAssignment as respondToAssignmentLogic, updateTripStatus as updateTripStatusLogic } from "./trip.controller.js";

// Get trips assigned to the logged-in driver
export const getMyDriverTrips = async (req, res) => {
    try {
        // req.staff is set by the staffConductorDriver middleware
        const trips = await Trip.find({ driver_id: req.staff._id })
            .populate("route_id")
            .populate("vehicle_id")
            .populate({
                path: "conductor_id",
                populate: { path: "user_id", select: "fullName email phone" }
            })
            .sort({ departure_datetime: 1 });

        res.status(200).json(trips);
    } catch (error) {
        console.error("Error fetching driver trips:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Re-export logic from trip controller to keep things DRY
export const respondToAssignment = respondToAssignmentLogic;
export const updateTripStatus = updateTripStatusLogic;
