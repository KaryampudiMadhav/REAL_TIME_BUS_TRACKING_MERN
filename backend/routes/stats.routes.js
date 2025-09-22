import express from "express";
const statsRouter = express.Router();
import {
  verifyToken,
  staffMunicipal,
} from "./../middlewares/protectedRoutes.js";
import { getAdminDashboardStats } from "./../controllers/stats.controller.js";

// The route is protected and for admins only
statsRouter
  .route("/admin-stats")
  .get(verifyToken, staffMunicipal, getAdminDashboardStats);

export default statsRouter;
