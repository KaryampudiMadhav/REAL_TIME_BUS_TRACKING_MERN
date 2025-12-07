import Depot from "../models/Depot.model.js";
import Vehicle from "../models/vehicle.model.js";

export const createVehicle = async (req, res) => {
  const { bus_number, service_type, total_seats, amenities, depot_id, status } =
    req.body;

  //  "bus_number": "AP37UD1234",
  // "service_type": "Ultra Deluxe",
  // "total_seats": 48,
  // "amenities": ["AC", "Push-back Seats"],
  // "depot_id": "68cc2a7f940bd1566cef2b4e",
  // "status": "AVAILABLE"

  if (!bus_number || !service_type || !total_seats || !depot_id || !status) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    // Check if a vehicle with this bus number already exists
    const vehicleExists = await Vehicle.findOne({ bus_number });
    if (vehicleExists) {
      return res
        .status(400)
        .json({ message: "A vehicle with this bus number already exists" });
    }

    // Check if the provided depot_id is valid
    const depotExists = await Depot.findById(depot_id);
    if (!depotExists) {
      return res
        .status(404)

        .json({ message: "Depot not found. Cannot add vehicle." });
    }

    const vehicle = await Vehicle.create({
      bus_number,
      service_type,
      total_seats,
      amenities,
      depot_id,
      status,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating vehicle", error: error.message });
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    // Populate the depot_id to show the depot's name and city instead of just the ID
    const vehicles = await Vehicle.find({}).populate("depot_id", "name city");
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { service_type, total_seats, amenities, depot_id, status } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      vehicle.service_type = service_type || vehicle.service_type;
      vehicle.total_seats = total_seats || vehicle.total_seats;
      vehicle.amenities = amenities || vehicle.amenities;
      vehicle.depot_id = depot_id || vehicle.depot_id;
      vehicle.status = status || vehicle.status;

      const updatedVehicle = await vehicle.save();
      res.status(200).json(updatedVehicle);
    } else {
      res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating vehicle", error: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      await vehicle.deleteOne();
      res.status(200).json({ message: "Vehicle removed successfully" });
    } else {
      res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
