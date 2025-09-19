import Trip from "../models/trip.model.js";
import Ticket from "../models/ticket.model.js";
import Notification from "../models/notification.model.js";
// 1. Get all trips assigned to conductor
export const getMyTrips = async (req, res) => {
  try {
    const staffProfile = await Staff.findOne({ user_id: req.user._id });
    if (!staffProfile)
      return res.status(404).json({ message: "Staff profile not found." });
    const trips = await Trip.find({ conductor_id: staffProfile._id });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Get passenger list for a trip
export const getTripPassengers = async (req, res) => {
  try {
    const tickets = await Ticket.find({ trip_id: req.params.tripId }).populate(
      "user_id",
      "fullName email"
    );
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. Get notifications for conductor
export const getMyNotifications = async (req, res) => {
  try {
    const staffProfile = await Staff.findOne({ user_id: req.user._id });
    if (!staffProfile)
      return res.status(404).json({ message: "Staff profile not found." });
    const notifications = await Notification.find({
      staff_id: staffProfile._id,
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. Get past trips for conductor
export const getMyTripHistory = async (req, res) => {
  try {
    const staffProfile = await Staff.findOne({ user_id: req.user._id });
    if (!staffProfile)
      return res.status(404).json({ message: "Staff profile not found." });
    const trips = await Trip.find({
      conductor_id: staffProfile._id,
      status: { $in: ["COMPLETED", "CANCELLED"] },
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. End trip / update status
export const updateTripStatus = async (req, res) => {
  try {
    const staffProfile = await Staff.findOne({ user_id: req.user._id });
    if (!staffProfile)
      return res.status(404).json({ message: "Staff profile not found." });
    const trip = await Trip.findOne({
      _id: req.params.tripId,
      conductor_id: staffProfile._id,
    });
    if (!trip)
      return res
        .status(404)
        .json({ message: "Trip not found or not assigned to you." });
    trip.status = req.body.status;
    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
import Staff from "../models/staff.model.js";
import IssueReport from "../models/issueReport.model.js";

export const createIssueReport = async (req, res) => {
  const { trip_id, issue_type, message } = req.body;
  try {
    // Find the staff profile for the logged-in user
    const staffProfile = await Staff.findOne({ user_id: req.user._id });
    if (!staffProfile) {
      return res.status(404).json({ message: "Staff profile not found." });
    }

    const report = await IssueReport.create({
      trip_id,
      reported_by_staff_id: staffProfile._id,
      issue_type,
      message,
    });
    res.status(201).json(report);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating issue report.", error: error.message });
  }
};
