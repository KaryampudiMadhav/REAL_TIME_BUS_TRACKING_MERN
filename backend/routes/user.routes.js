import express from "express";

import { verifyToken } from "./../middlewares/protectedRoutes.js";
import {
  checkAuth,
  forgotPassword,
  login,
  Logout,
  resetPassword,
  signUp,
  verifyEmail,
} from "./../controllers/user.controller.js";

export const routes = express.Router();

routes.post("/checkauth", verifyToken, checkAuth);
routes.post("/signup", signUp);
routes.post("/login", login);
routes.post("/logout", Logout);
routes.post("/verify", verifyEmail);
routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password/:token", resetPassword);
