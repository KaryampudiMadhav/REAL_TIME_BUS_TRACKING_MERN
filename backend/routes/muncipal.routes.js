import express from "express";
import { getCrowdReport } from "../controllers/muncipal.controller.js";
import {
  staffMunicipal,
  verifyToken,
} from "./../middlewares/protectedRoutes.js";
const muncipalRouter = express.Router();

// The route is protected and for municipal users only
muncipalRouter
  .route("/crowd-report")
  .get(verifyToken, staffMunicipal, getCrowdReport);

export default muncipalRouter;
