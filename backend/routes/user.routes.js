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
  sendPhoneOTP,
  verifyPhoneOTP,
  resendVerificationEmail,
  searchAvailableTrips,
  getPopularRoutes,
} from "./../controllers/user.controller.js";

export const routes = express.Router();

routes.get("/checkauth", verifyToken, checkAuth);
routes.post("/signup", signUp);
routes.post("/login", login);
routes.post("/logout", Logout);
routes.post("/verify", verifyEmail);
routes.post("/forgot-password", forgotPassword);
routes.post("/resend-verification", resendVerificationEmail);
routes.post("/reset-password/:token", resetPassword);
routes.post("/send-phone-otp", sendPhoneOTP);
routes.post("/verify-phone-otp", verifyPhoneOTP);
routes.get("/search", searchAvailableTrips);
routes.get("/popular-routes", getPopularRoutes);
