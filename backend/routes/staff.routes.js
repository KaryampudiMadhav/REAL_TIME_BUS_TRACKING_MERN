import express from "express";

import {
  createStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
  staffAdminLogin,
  staffMunicipalLogin,
  staffWorkerLogin,
  staffLogout,
} from "../controllers/staff.controller.js";
import { staffAdmin, staffMunicipal } from "../middlewares/protectedRoutes.js";
const staffRouter = express.Router();
// Admin routes
staffRouter.route("/admin/login").post(staffAdminLogin);
staffRouter
  .route("/admin")
  .post(staffAdmin, createStaff)
  .get(staffAdmin, getAllStaff);
staffRouter
  .route("/admin/:id")
  .put(staffAdmin, updateStaff)
  .delete(staffAdmin, deleteStaff);

// Municipal routes
staffRouter.route("/municipal/login").post(staffMunicipalLogin);
staffRouter.route("/municipal").get(staffMunicipal, getAllStaff);

// Worker (conductor/driver) routes
staffRouter.route("/worker/login").post(staffWorkerLogin);

// Logout for all staff
staffRouter.route("/logout").post(staffLogout);

export default staffRouter;
