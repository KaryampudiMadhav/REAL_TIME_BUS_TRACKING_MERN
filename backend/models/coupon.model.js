import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true },
  expiresAt: { type: Date },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
