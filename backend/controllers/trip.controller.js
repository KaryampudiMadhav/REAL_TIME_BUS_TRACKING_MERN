// Get location history for a trip]
import Trip from "../models/trip.model.js";
import Route from "../models/route.model.js";
import Vehicle from "../models/vehicle.model.js";
import Staff from "../models/staff.model.js";

// Record overcrowding event for a trip
export const recordOvercrowding = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { passengerCount } = req.body;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    trip.overcrowdingEvents.push({ date: new Date(), passengerCount });
    await trip.save();
    res.status(200).json({ message: "Overcrowding event recorded." });
  } catch (error) {
    res.status(500).json({ message: "Error recording overcrowding event" });
  }
};

// Get overcrowding data by day
export const getOvercrowdingByDay = async (req, res) => {
  try {
    // Optional: filter by date range
    const { start, end } = req.query;
    const match = {};
    if (start && end) {
      match.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    // Aggregate overcrowding events by day
    const trips = await Trip.aggregate([
      { $unwind: "$overcrowdingEvents" },
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$overcrowdingEvents.date",
            },
          },
          totalEvents: { $sum: 1 },
          avgPassengerCount: { $avg: "$overcrowdingEvents.passengerCount" },
          maxPassengerCount: { $max: "$overcrowdingEvents.passengerCount" },
        },
      },
      { $sort: { _id: -1 } },
    ]);
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching overcrowding data" });
  }
};
export const getTripLocationHistory = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    res.json({ location_history: trip.location_history });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching location history",
      error: error.message,
    });
  }
};

export const createTrip = async (req, res) => {
  const {
    route_id,
    vehicle_id,
    driver_id,
    conductor_id,
    departure_datetime,
    seat_allocation,
  } = req.body;

  try {
    // --- Validation ---
    const route = await Route.findById(route_id);
    if (!route) return res.status(404).json({ message: "Route not found." });

    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle)
      return res.status(404).json({ message: "Vehicle not found." });
    if (vehicle.status !== "AVAILABLE")
      return res.status(400).json({ message: "Vehicle is not available." });

    const driver = await Staff.findById(driver_id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });

    // --- Create Trip ---
    const arrival_datetime = new Date(departure_datetime);
    const routeDuration =
      route.stops[route.stops.length - 1].arrival_offset_mins;
    arrival_datetime.setMinutes(arrival_datetime.getMinutes() + routeDuration);

    const trip = await Trip.create({
      route_id,
      vehicle_id,
      driver_id,
      conductor_id,
      departure_datetime,
      arrival_datetime,
      seat_allocation,
    });

    // Update vehicle status to ON_TRIP
    vehicle.status = "ON_TRIP";
    await vehicle.save();

    res.status(201).json(trip);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating trip", error: error.message });
  }
};

export const getAllTrips = async (req, res) => {
  try {
    // Example of a potential filter by status
    const filter = req.query.status ? { status: req.query.status } : {};

    const trips = await Trip.find({ ...filter })
      .populate({ path: "route_id", select: "routeName origin destination" })
      .populate({ path: "vehicle_id", select: "bus_number service_type" })
      .populate({
        path: "driver_id",
        populate: { path: "user_id", select: "fullName" },
      });

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateTripStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (trip) {
      trip.status = status;
      await trip.save();

      // If trip is cancelled or completed, make the vehicle available again
      if (status === "CANCELLED" || status === "COMPLETED") {
        await Vehicle.findByIdAndUpdate(trip.vehicle_id, {
          status: "AVAILABLE",
        });
      }

      res.status(200).json(trip);
    } else {
      res.status(404).json({ message: "Trip not found" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating trip status", error: error.message });
  }
};

export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("route_id")
      .populate("vehicle_id")
      .populate({
        path: "driver_id",
        populate: { path: "user_id", select: "fullName" },
      })
      .populate({
        path: "conductor_id",
        populate: { path: "user_id", select: "fullName" },
      });

    if (trip) {
      res.status(200).json(trip);
    } else {
      res.status(404).json({ message: "Trip not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
