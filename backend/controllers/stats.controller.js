import Booking from "../models/booking.model.js";
import Trip from "../models/trip.model.js";
import Vehicle from "../models/vehicle.model.js";
import SupportTicket from "./../models/support.model.js";

export const getAdminDashboardStats = async (req, res) => {
  try {
    // --- Define Date Range for "Today" ---
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    // --- Perform all database queries in parallel ---
    const [
      totalRevenueResult,
      todaysRevenueResult,
      ticketsSoldToday,
      tripsInProgress,
      vehiclesAvailable,
      openSupportTickets,
    ] = await Promise.all([
      // 1. Get total revenue of all time
      Booking.aggregate([
        { $match: { status: "CONFIRMED" } },
        { $group: { _id: null, total: { $sum: "$total_fare" } } },
      ]),
      // 2. Get total revenue for today
      Booking.aggregate([
        {
          $match: {
            status: "CONFIRMED",
            createdAt: { $gte: today, $lt: tomorrow },
          },
        },
        { $group: { _id: null, total: { $sum: "$total_fare" } } },
      ]),
      // 3. Get number of tickets sold today
      Booking.countDocuments({
        status: "CONFIRMED",
        createdAt: { $gte: today, $lt: tomorrow },
      }),
      // 4. Get number of trips currently in progress
      Trip.countDocuments({ status: "IN_TRANSIT" }),
      // 5. Get number of available vehicles
      Vehicle.countDocuments({ status: "AVAILABLE" }),
      // 6. Get number of open support tickets
      SupportTicket.countDocuments({ status: "OPEN" }),
    ]);

    // --- Construct the final response object ---
    res.status(200).json({
      totalRevenue: totalRevenueResult[0]?.total || 0,
      todaysRevenue: todaysRevenueResult[0]?.total || 0,
      ticketsSoldToday,
      tripsInProgress,
      vehiclesAvailable,
      openSupportTickets,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
