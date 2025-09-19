import Trip from "../models/trip.model.js";
import Notification from "../models/notification.model.js";
export const getCrowdReport = async (req, res) => {
  try {
    // 1. Find all trips that are currently in progress
    const inTransitTrips = await Trip.find({ status: "IN_TRANSIT" })
      .populate("route_id", "routeName")
      .populate("vehicle_id", "total_seats bus_number");

    // 2. Calculate the occupancy for each trip
    const crowdReport = inTransitTrips.map((trip) => {
      const totalBooked =
        trip.tickets_booked.online + trip.tickets_booked.offline;
      const capacity = trip.vehicle_id.total_seats;
      const occupancy = Math.round((totalBooked / capacity) * 100);

      return {
        tripId: trip._id,
        routeName: trip.route_id.routeName,
        busNumber: trip.vehicle_id.bus_number,
        capacity,
        totalBooked,
        occupancy_percentage: occupancy,
      };
    });

    const overcrowdedTrips = crowdReport.filter(
      (trip) => trip.occupancy_percentage > 95
    );

    res.status(200).json(overcrowdedTrips);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ... other imports

export const requestExtraBus = async (req, res) => {
  const { routeName, reason } = req.body;
  try {
    // Create a notification document targeted at Admins
    const newNotification = await Notification.create({
      recipient_role: "ADMIN",
      title: "Extra Bus Request",
      message: `Request for extra bus on route: ${routeName}. Reason: ${reason}`,
      link: "/admin/trips/schedule", // Link to the trip scheduling page
    });

    // This is the tricky part: we need to tell our Socket.IO server to send a real-time alert.
    // The best way is to use the request object to access the io instance.
    const io = req.app.get("socketio");
    io.to("admin_notifications").emit("new_notification", newNotification);

    res
      .status(200)
      .json({ success: true, message: "Request sent to the admin dashboard." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ... (getCrowdReport function remains the same)
