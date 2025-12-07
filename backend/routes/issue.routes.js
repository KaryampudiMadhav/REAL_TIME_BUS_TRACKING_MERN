import express from "express";
const issueRouter = express.Router();

import { verifyToken, staffAdmin } from "./../middlewares/protectedRoutes.js";
import {
  getAllIssueReports,
  updateIssueStatus,
  getMyIssueReports,
  getBusIssues,
} from "./../controllers/reportIssues.controller.js";
// All users: get confirmed/resolved issues for a bus
issueRouter.get("/bus/:vehicleId", verifyToken, getBusIssues);

// Admin: get all issues
issueRouter.route("/").get(verifyToken, staffAdmin, getAllIssueReports);
// User/Staff: get my reported issues
issueRouter.route("/my").get(verifyToken, getMyIssueReports);
issueRouter
  .route("/:id/status")
  .put(verifyToken, staffAdmin, updateIssueStatus);

export default issueRouter;
