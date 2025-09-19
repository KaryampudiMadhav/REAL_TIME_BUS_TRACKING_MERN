import express from "express";
import { getTripTrackingInfo } from "./../controllers/orsm.controller.js";
const orsmRouter = express.Router();

// ... your other public routes
orsmRouter.get("/trips/:id/tracking-info", getTripTrackingInfo);

export default orsmRouter;
