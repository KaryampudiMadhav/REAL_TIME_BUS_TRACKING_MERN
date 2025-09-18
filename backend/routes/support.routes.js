import express from "express";

import {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
  addAdminNote,
} from "../controllers/supportTicket.controller.js";
import { verifyToken, admin } from "../middlewares/protectedRoutes.js";
// --- Routes for Passengers (any logged-in user) ---
const supportRouter = express.Router();
supportRouter.route("/").post(verifyToken, createTicket);

supportRouter.route("/mytickets").get(verifyToken, getMyTickets);

// --- Routes for Admins ---
supportRouter.route("/admin").get(verifyToken, admin, getAllTickets);

supportRouter.route("/:id/status").put(verifyToken, admin, updateTicketStatus);

supportRouter.route("/:id/notes").post(verifyToken, admin, addAdminNote);

export default supportRouter;
