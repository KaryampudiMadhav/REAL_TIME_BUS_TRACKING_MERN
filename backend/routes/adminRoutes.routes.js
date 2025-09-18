import express from "express";

import {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} from "../controllers/route.controller.js";
import { verifyToken, admin } from "../middlewares/protectedRoutes.js";
const adminRoutesRouter = express.Router();
// All routes are protected and require admin access
adminRoutesRouter
  .route("/")
  .post(verifyToken, admin, createRoute)
  .get(verifyToken, admin, getAllRoutes);

adminRoutesRouter
  .route("/:id")
  .get(verifyToken, admin, getRouteById)
  .put(verifyToken, admin, updateRoute)
  .delete(verifyToken, admin, deleteRoute);

export default adminRoutesRouter;
