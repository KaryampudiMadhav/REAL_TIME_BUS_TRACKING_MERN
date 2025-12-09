import Trip from "../models/trip.model.js";
import Route from "../models/route.model.js";
import Vehicle from "../models/vehicle.model.js";
import Staff from "../models/staff.model.js";
import IssueReport from "../models/IssueReport.model.js";

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

    // Set conductor is_on_duty to true when assigned
    if (conductor_id) {
      const conductor = await Staff.findById(conductor_id);
      if (!conductor)
        return res.status(404).json({ message: "Conductor not found." });

      // --- VALIDATION: Check if conductor is already assigned for this DATE ---
      // We assume "1 bus daily for one conductor" means 1 trip per day (or set of trips).
      // Here we check if they have ANY overlapping trip or just any trip on that day.
      // Let's implement strict 1-trip-per-day as requested.
      const tripDate = new Date(departure_datetime);
      const startOfDay = new Date(tripDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(tripDate.setHours(23, 59, 59, 999));

      const existingTrip = await Trip.findOne({
        conductor_id,
        departure_datetime: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: "CANCELLED" }, // Ignore cancelled trips
      });

      if (existingTrip) {
        return res
          .status(400)
          .json({ message: "Conductor is already assigned to a bus on this date." });
      }

      conductor.is_on_duty = true;
      await conductor.save();
    }

    // --- Create Trip (with Repeat Logic) ---
    const tripsCreated = [];
    const repeatDays = req.body.repeat_days ? parseInt(req.body.repeat_days) : 0;
    const initialDeparture = new Date(departure_datetime);

    // Loop to create current Trip + Repeated Trips
    // If repeatDays = 0, loops once (i=0). If 30, loops 31 times.
    for (let i = 0; i <= repeatDays; i++) {
      const currentDeparture = new Date(initialDeparture);
      currentDeparture.setDate(initialDeparture.getDate() + i);

      // Re-calculate arrival based on new departure
      const currentArrival = new Date(currentDeparture);
      const routeDuration =
        route.stops[route.stops.length - 1].arrival_offset_mins;
      currentArrival.setMinutes(currentArrival.getMinutes() + routeDuration);

      // NOTE: For repeated trips, we should ideally check conductor availability for EACH day.
      // But if we are bulk-assigning "Daily Bus" to one conductor, it implies they do it every day.
      // So we skip the "already assigned" check for the subsequent iterations within this SAME request/batch.
      // However, if there was a PRE-EXISTING trip on day 5, this should ideally fail or skip.
      // For simplicity in this iteration, we trust the bulk create, or let it fail if unique constraint violated (not set yet).
      // Let's add a quick check for repeated days to prevent collisions.
      if (i > 0 && conductor_id) {
        const sOfDay = new Date(currentDeparture).setHours(0, 0, 0, 0);
        const eOfDay = new Date(currentDeparture).setHours(23, 59, 59, 999);
        const clash = await Trip.findOne({
          conductor_id,
          departure_datetime: { $gte: sOfDay, $lte: eOfDay },
          status: { $ne: "CANCELLED" }
        });
        if (clash) {
          console.warn(`Skipping date ${currentDeparture} for conductor ${conductor_id} as they are busy.`);
          continue; // Skip creating this specific day's trip
        }
      }


      const trip = await Trip.create({
        route_id,
        vehicle_id,
        driver_id,
        conductor_id,
        departure_datetime: currentDeparture,
        arrival_datetime: currentArrival,
        seat_allocation,
      });
      tripsCreated.push(trip);
    }

    // Update vehicle status to ON_TRIP (only relevant for 'today', but fine to set)
    // If we schedule for future, vehicle shouldn't necessarily be ON_TRIP now.
    // Logic: If departure is close (e.g. within 2 hours), set ON_TRIP. Otherwise AVAILABLE?
    // Current system seems simple: Create Trip -> Vehicle ON_TRIP.
    // If we create 30 trips, the vehicle is technically committed.
    vehicle.status = "ON_TRIP";
    await vehicle.save();

    res.status(201).json({
      message: `Successfully created ${tripsCreated.length} trip(s).`,
      trip: tripsCreated[0]
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating trip", error: error.message });
  }
};

// Update trip details (Admin) - Reassign conductor/driver/vehicle
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_id, driver_id, conductor_id, status } = req.body;

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: "Trip not found." });

    // Handle Vehicle Change
    if (vehicle_id && vehicle_id !== trip.vehicle_id.toString()) {
      // Free up old vehicle
      const oldVehicle = await Vehicle.findById(trip.vehicle_id);
      if (oldVehicle) {
        oldVehicle.status = "AVAILABLE";
        await oldVehicle.save();
      }
      // Assign new vehicle
      const newVehicle = await Vehicle.findById(vehicle_id);
      if (!newVehicle)
        return res.status(404).json({ message: "New vehicle not found." });
      if (newVehicle.status !== "AVAILABLE")
        return res
          .status(400)
          .json({ message: "New vehicle is not available." });

      newVehicle.status = "ON_TRIP"; // Or correct status based on trip status
      await newVehicle.save();
      trip.vehicle_id = vehicle_id;
    }

    // Handle Driver Change
    if (driver_id) trip.driver_id = driver_id;

    // Handle Conductor Change
    if (conductor_id && conductor_id !== trip.conductor_id.toString()) {
      // Validate Conductor Availability for that day
      // (Optional: strict check if they are already on another trip that overlaps)
      // For now, allow reassignment but warn/check if strict 1-per-day needed.
      // Ideally, check for conflicts here too.
      const startOfDay = new Date(trip.departure_datetime).setHours(0, 0, 0, 0);
      const endOfDay = new Date(trip.departure_datetime).setHours(23, 59, 59, 999);
      const existingTrip = await Trip.findOne({
        conductor_id,
        departure_datetime: { $gte: startOfDay, $lte: endOfDay },
        _id: { $ne: trip._id } // Exclude current trip
      });

      if (existingTrip) {
        return res.status(400).json({ message: "Conductor is already assigned to another trip on this date." });
      }

      trip.conductor_id = conductor_id;
      // Update new conductor status
      await Staff.findByIdAndUpdate(conductor_id, { is_on_duty: true });
    }

    // Handle Status Change
    if (status) {
      trip.status = status;
      if (status === "CANCELLED" || status === "COMPLETED") {
        const vId = vehicle_id || trip.vehicle_id;
        await Vehicle.findByIdAndUpdate(vId, {
          status: "AVAILABLE",
        });
      }
    }

    await trip.save();
    res.json({ message: "Trip updated successfully", trip });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export const getAllTrips = async (req, res) => {
  try {
    // Example of a potential filter by status
    const filter = req.query.status ? { status: req.query.status } : {};

    const trips = await Trip.find({ ...filter })
      .populate("route_id")
      .populate("vehicle_id")
      .populate("driver_id")
      .populate("conductor_id")
      .sort({ departure_datetime: -1 }); // Show newest first

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error in getAllTrips:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
      .populate("driver_id", "employee_id work_contact_number") // Only populate Staff fields
      .populate("conductor_id", "employee_id work_contact_number");

    if (trip) {
      // Fetch active issues for this trip
      const issues = await IssueReport.find({
        trip_id: trip._id,
        status: { $ne: 'RESOLVED' } // Only show active issues
      }).sort({ createdAt: -1 });

      // Convert mongoose document to object to allow appending new fields
      const tripObj = trip.toObject();
      tripObj.issues = issues;

      res.status(200).json(tripObj);
    } else {
      res.status(404).json({ message: "Trip not found" });
    }
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
