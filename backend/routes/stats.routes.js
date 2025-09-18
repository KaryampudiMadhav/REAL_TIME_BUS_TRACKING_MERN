import express from "express";
const router = express.Router();
import { getAdminDashboardStats } from "../controllers/analytics.controller.js";
import { verifyToken, admin } from "./../middlewares/protectedRoutes.js";

// The route is protected and for admins only
router.route("/admin-stats").get(verifyToken, admin, getAdminDashboardStats);

export default router;
