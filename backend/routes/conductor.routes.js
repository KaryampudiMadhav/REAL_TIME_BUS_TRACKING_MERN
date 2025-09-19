import express from "express";
const conductorRouter = express.Router();

import { createIssueReport } from "../controllers/conductor.controller.js";
import { verifyToken } from "./../middlewares/protectedRoutes.js";

// ... other driver routes
conductorRouter.post("/issues", verifyToken, createIssueReport);

export default conductorRouter;
