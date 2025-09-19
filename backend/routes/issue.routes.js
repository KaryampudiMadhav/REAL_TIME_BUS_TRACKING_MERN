import express from "express";
const issueRouter = express.Router();

import { verifyToken, admin } from "./../middlewares/protectedRoutes.js";
import {
  getAllIssueReports,
  updateIssueStatus,
  getMyIssueReports,
} from "./../controllers/reportIssues.controller.js";

// Admin: get all issues
issueRouter.route("/").get(verifyToken, admin, getAllIssueReports);
// User/Staff: get my reported issues
issueRouter.route("/my").get(verifyToken, getMyIssueReports);
issueRouter.route("/:id/status").put(verifyToken, admin, updateIssueStatus);

export default issueRouter;
