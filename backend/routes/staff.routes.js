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
import { staffAdmin, staffMunicipal, protectStaff } from "../middlewares/protectedRoutes.js";
import { getCurrentStaff } from "../controllers/staff.controller.js";
const staffRouter = express.Router();

staffRouter.get("/me", protectStaff, getCurrentStaff);
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
