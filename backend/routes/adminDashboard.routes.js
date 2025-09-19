import express from "express";
import { verifyToken, admin } from "../middlewares/protectedRoutes.js";
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
} from "../controllers/adminDashboard.controller.js";

const adminDashboardRouter = express.Router();

adminDashboardRouter.get("/overview", verifyToken, admin, getDashboardOverview);
adminDashboardRouter.get("/buses", verifyToken, admin, getAllBuses);
adminDashboardRouter.get("/staff", verifyToken, admin, getAllStaff);
adminDashboardRouter.get("/users", verifyToken, admin, getAllUsers);
adminDashboardRouter.get("/trips", verifyToken, admin, getAllTrips);
adminDashboardRouter.get("/issues", verifyToken, admin, getAllIssues);
adminDashboardRouter.get(
  "/notifications",
  verifyToken,
  admin,
  getAdminNotifications
);
adminDashboardRouter.get("/trip-stats", verifyToken, admin, getTripStats);
adminDashboardRouter.get("/audit-logs", verifyToken, admin, getAuditLogs);

export default adminDashboardRouter;
