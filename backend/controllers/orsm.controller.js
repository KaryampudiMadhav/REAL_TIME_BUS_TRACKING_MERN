import Trip from "../models/trip.model.js";
import axios from "axios";

export const getTripTrackingInfo = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("route_id");
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 1. Get all the stop coordinates from the trip's route
    const coordinatesString = trip.route_id.stops
      .map((s) => `${s.longitude},${s.latitude}`)
      .join(";");

    // 2. Call the OSRM API to get the detailed road path
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;
    const osrmResponse = await axios.get(osrmUrl);

    // 3. Extract the path (an array of [lat, lng] points) and initial ETA
    const routeGeometry = osrmResponse.data.routes[0].geometry.coordinates.map(
      (c) => [c[1], c[0]]
    ); // Flip OSRM's [lng, lat] to Leaflet's [lat, lng]
    const initialEtaMinutes = Math.round(
      osrmResponse.data.routes[0].duration / 60
    );

    // 4. Send the complete data to the frontend
    res.json({
      stops: trip.route_id.stops,
      path: routeGeometry, // The detailed path for the Polyline
      initialEta: initialEtaMinutes,
      busPosition: trip.live_location || {
        latitude: trip.route_id.stops[0].latitude,
        longitude: trip.route_id.stops[0].longitude,
      },
    });
  } catch (error) {
    console.error("Error fetching tracking info:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
