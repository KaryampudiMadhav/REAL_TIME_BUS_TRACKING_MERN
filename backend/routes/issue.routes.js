import express from "express";
const issueRouter = express.Router();

import { verifyToken, admin } from "./../middlewares/protectedRoutes.js";
import {
  getAllIssueReports,
  updateIssueStatus,
} from "./../controllers/reportIssues.controller.js";

issueRouter.route("/").get(verifyToken, admin, getAllIssueReports);
issueRouter.route("/:id/status").put(verifyToken, admin, updateIssueStatus);

export default issueRouter;
