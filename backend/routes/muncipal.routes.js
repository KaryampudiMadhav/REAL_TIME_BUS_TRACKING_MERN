import express from "express";
import { getCrowdReport, getMunicipalAnalytics, requestExtraBus } from "../controllers/muncipal.controller.js";
import {
  staffMunicipal,
  verifyToken,
} from "./../middlewares/protectedRoutes.js";
const muncipalRouter = express.Router();

// The route is protected and for municipal users only
// The route is protected and for municipal users only
muncipalRouter
  .route("/crowd-report")
  .get(verifyToken, staffMunicipal, getCrowdReport);

muncipalRouter
  .route("/analytics")
  .get(verifyToken, staffMunicipal, getMunicipalAnalytics);

muncipalRouter
  .route("/request-bus")
  .post(verifyToken, staffMunicipal, requestExtraBus);

export default muncipalRouter;
