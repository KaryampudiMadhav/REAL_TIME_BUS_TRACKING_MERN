import express from "express";
import { staffAdmin } from "../middlewares/protectedRoutes.js";
import {
  createCoupon,
  getAllCoupons,
  deactivateCoupon,
} from "../controllers/coupon.controller.js";

const couponRouter = express.Router();

couponRouter.post("/", staffAdmin, createCoupon);
couponRouter.get("/", staffAdmin, getAllCoupons);
couponRouter.put("/:id/deactivate", staffAdmin, deactivateCoupon);

export default couponRouter;
