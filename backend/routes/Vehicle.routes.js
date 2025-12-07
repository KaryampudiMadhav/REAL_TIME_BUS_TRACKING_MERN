import express from "express";
import {
  createVehicle,
  getAllVehicles,
  updateVehicle,
  deleteVehicle,
} from "../controllers/Vehicle.controller.js";
import { staffAdmin } from "../middlewares/protectedRoutes.js";
const vehicleRouter = express.Router();
vehicleRouter
  .route("/")
  .post(staffAdmin, createVehicle)
  .get(staffAdmin, getAllVehicles);

vehicleRouter
  .route("/:id")
  .put(staffAdmin, updateVehicle)
  .delete(staffAdmin, deleteVehicle);

export default vehicleRouter;
