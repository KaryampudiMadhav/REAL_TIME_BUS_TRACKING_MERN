import express from "express";
import {
  createVehicle,
  getAllVehicles,
  updateVehicle,
  deleteVehicle,
} from "../controllers/Vehicle.controller.js";
import { verifyToken, admin } from "../middlewares/protectedRoutes.js";
const vehicleRouter = express.Router();
vehicleRouter
  .route("/")
  .post(verifyToken, admin, createVehicle)
  .get(verifyToken, admin, getAllVehicles);

vehicleRouter
  .route("/:id")
  .put(verifyToken, admin, updateVehicle)
  .delete(verifyToken, admin, deleteVehicle);

export default vehicleRouter;
