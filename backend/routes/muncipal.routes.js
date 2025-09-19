import express from "express";
import { getCrowdReport } from "../controllers/muncipal.controller.js";
import { municipal, verifyToken } from "./../middlewares/protectedRoutes.js";
const muncipalRouter = express.Router();

// The route is protected and for municipal users only
muncipalRouter
  .route("/crowd-report")
  .get(verifyToken, municipal, getCrowdReport);

export default muncipalRouter;
