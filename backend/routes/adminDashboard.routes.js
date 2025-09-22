import express from "express";
import { verifyToken, staffAdmin } from "../middlewares/protectedRoutes.js";
import {
  getDashboardOverview,
  getAllBuses,
  getAllStaff,
  getAllUsers,
  getAllTrips,
  getAllIssues,
  getAdminNotifications,
  getTripStats,
  getAuditLogs,
  getSOSAlerts,
} from "../controllers/adminDashboard.controller.js";
// View SOS alerts
const adminDashboardRouter = express.Router();
adminDashboardRouter.get("/sos-alerts", verifyToken, staffAdmin, getSOSAlerts);
adminDashboardRouter.get(
  "/overview",
  verifyToken,
  staffAdmin,
  getDashboardOverview
);
adminDashboardRouter.get("/buses", verifyToken, staffAdmin, getAllBuses);
adminDashboardRouter.get("/staff", verifyToken, staffAdmin, getAllStaff);
adminDashboardRouter.get("/users", verifyToken, staffAdmin, getAllUsers);
adminDashboardRouter.get("/trips", verifyToken, staffAdmin, getAllTrips);
adminDashboardRouter.get("/issues", verifyToken, staffAdmin, getAllIssues);
adminDashboardRouter.get(
  "/notifications",
  verifyToken,
  staffAdmin,
  getAdminNotifications
);
adminDashboardRouter.get("/trip-stats", verifyToken, staffAdmin, getTripStats);
adminDashboardRouter.get("/audit-logs", verifyToken, staffAdmin, getAuditLogs);

export default adminDashboardRouter;
