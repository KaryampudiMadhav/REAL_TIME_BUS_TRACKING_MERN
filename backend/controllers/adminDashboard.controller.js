import SOSAlert from "../models/sosAlert.model.js";
// Get recent SOS alerts
export const getSOSAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("trip_id staff_id");
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching SOS alerts" });
  }
};
import Trip from "../models/trip.model.js";
import Vehicle from "../models/vehicle.model.js";
import Staff from "../models/staff.model.js";
import User from "../models/user.model.js";
import IssueReport from "../models/issueReport.model.js";
import Notification from "../models/notification.model.js";

// 1. Dashboard overview
export const getDashboardOverview = async (req, res) => {
  try {
    const trips = await Trip.countDocuments();
    const vehicles = await Vehicle.countDocuments();
    const staff = await Staff.countDocuments();
    const users = await User.countDocuments();
    const issues = await IssueReport.countDocuments({
      status: { $ne: "RESOLVED" },
    });
    res.json({ trips, vehicles, staff, users, issues });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Get all buses
export const getAllBuses = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. Get all staff
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().populate("user_id", "fullName role");
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. Get all trips
export const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 6. Get all issues
export const getAllIssues = async (req, res) => {
  try {
    const issues = await IssueReport.find();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 7. Get admin notifications
export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ role: "ADMIN" }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 8. Analytics: trip stats
export const getTripStats = async (req, res) => {
  try {
    const completed = await Trip.countDocuments({ status: "COMPLETED" });
    const cancelled = await Trip.countDocuments({ status: "CANCELLED" });
    const delayed = await Trip.countDocuments({ status: "DELAYED" });
    res.json({ completed, cancelled, delayed });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 9. Audit logs (basic)
import logger from "../utils/logger.js";
export const getAuditLogs = async (req, res) => {
  try {
    // For demo, read last 100 lines from combined.log
    const fs = await import("fs/promises");
    const logData = await fs.readFile("combined.log", "utf-8");
    const lines = logData.split("\n").slice(-100);
    res.json({ logs: lines });
  } catch (error) {
    res.status(500).json({ message: "Error reading logs" });
  }
};

// 10. Verify Issue Report
export const verifyIssueReport = async (req, res) => {
  try {
    const { issueIds, isVerified, adminNote } = req.body;

    // Support single or multiple ID update
    const ids = Array.isArray(issueIds) ? issueIds : [req.params.id];

    await IssueReport.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          is_verified: isVerified,
          admin_verification_note: adminNote,
          status: isVerified ? "VERIFIED" : "REJECTED" // Optional: Update status enum if you want
        }
      }
    );

    res.status(200).json({ message: "Issues verified successfully" });
  } catch (error) {
    console.error("Error verifying issue:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
