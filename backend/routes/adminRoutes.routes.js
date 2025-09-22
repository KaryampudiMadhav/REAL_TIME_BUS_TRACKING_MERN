import express from "express";

import { staffAdmin } from "../middlewares/protectedRoutes.js";
import {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
  createUserByAdmin,
} from "./../controllers/adminRoutes.controller.js";
const adminRoutesRouter = express.Router();

adminRoutesRouter
  .route("/")
  .post(staffAdmin, createRoute)
  .post(staffAdmin, createUserByAdmin)
  .get(staffAdmin, getAllRoutes);

adminRoutesRouter
  .route("/:id")
  .get(staffAdmin, getRouteById)
  .put(staffAdmin, updateRoute)
  .delete(staffAdmin, deleteRoute);

export default adminRoutesRouter;
