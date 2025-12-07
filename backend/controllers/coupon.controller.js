import Coupon from "../models/coupon.model.js";

// Admin: create a coupon
export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, expiresAt, usageLimit } = req.body;
    const coupon = await Coupon.create({
      code,
      discountPercent,
      expiresAt,
      usageLimit,
    });
    res.status(201).json(coupon);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating coupon" });
  }
};

// Admin: get all coupons
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coupons" });
  }
};

// Admin: deactivate coupon
export const deactivateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Error deactivating coupon" });
  }
};
