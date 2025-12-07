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
  verifyIssueReport
} from "../controllers/adminDashboard.controller.js";

const adminDashboardRouter = express.Router();
adminDashboardRouter.get("/sos-alerts", staffAdmin, getSOSAlerts);
adminDashboardRouter.post("/issues/verify", staffAdmin, verifyIssueReport); // Bulk or single
adminDashboardRouter.get("/overview", staffAdmin, getDashboardOverview);
adminDashboardRouter.get("/buses", staffAdmin, getAllBuses);
adminDashboardRouter.get("/staff", staffAdmin, getAllStaff);
adminDashboardRouter.get("/users", staffAdmin, getAllUsers);
adminDashboardRouter.get("/trips", staffAdmin, getAllTrips);
adminDashboardRouter.get("/issues", staffAdmin, getAllIssues);
adminDashboardRouter.get("/notifications", staffAdmin, getAdminNotifications);
adminDashboardRouter.get("/trip-stats", staffAdmin, getTripStats);
adminDashboardRouter.get("/audit-logs", staffAdmin, getAuditLogs);

export default adminDashboardRouter;
