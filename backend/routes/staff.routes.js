import express from "express";

import {
  createStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller.js";
import { verifyToken, admin } from "../middlewares/protectedRoutes.js";
const staffRouter = express.Router();
staffRouter
  .route("/")
  .post(verifyToken, admin, createStaff)
  .get(verifyToken, admin, getAllStaff);

staffRouter
  .route("/:id")
  .put(verifyToken, admin, updateStaff)
  .delete(verifyToken, admin, deleteStaff);

export default staffRouter;
