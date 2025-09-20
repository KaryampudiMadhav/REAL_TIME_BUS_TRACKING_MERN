import express from "express";
import { verifyToken, admin } from "../middlewares/protectedRoutes.js";
import {
  createCoupon,
  getAllCoupons,
  deactivateCoupon,
} from "../controllers/coupon.controller.js";

const couponRouter = express.Router();

couponRouter.post("/", verifyToken, admin, createCoupon);
couponRouter.get("/", verifyToken, admin, getAllCoupons);
couponRouter.put("/:id/deactivate", verifyToken, admin, deactivateCoupon);

export default couponRouter;
