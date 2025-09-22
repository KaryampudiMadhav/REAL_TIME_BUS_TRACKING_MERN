import express from "express";
import { verifyToken, staffAdmin } from "../middlewares/protectedRoutes.js";
import {
  createCoupon,
  getAllCoupons,
  deactivateCoupon,
} from "../controllers/coupon.controller.js";

const couponRouter = express.Router();

couponRouter.post("/", verifyToken, staffAdmin, createCoupon);
couponRouter.get("/", verifyToken, staffAdmin, getAllCoupons);
couponRouter.put("/:id/deactivate", verifyToken, staffAdmin, deactivateCoupon);

export default couponRouter;
