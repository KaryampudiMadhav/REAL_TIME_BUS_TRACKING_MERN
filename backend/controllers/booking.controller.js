import Booking from "../models/booking.model.js";
import Coupon from "../models/coupon.model.js";

// Helper: Check if user is first-time booker
async function isFirstTimeUser(userId) {
  const count = await Booking.countDocuments({ user_id: userId });
  return count === 0;
}

// Booking creation with coupon/discount logic
export const createBooking = async (req, res) => {
  try {
    const {
      user_id,
      trip_id,
      couponCode,
      seat_numbers,
      total_fare,
      booking_channel,
      payment_id,
    } = req.body;
    let discountPercent = 0;
    let appliedCoupon = null;

    // First-time user discount logic
    if (await isFirstTimeUser(user_id)) {
      // Try to find a first-time coupon (e.g., code: "FIRST10")
      const firstCoupon = await Coupon.findOne({
        code: "FIRST10",
        isActive: true,
      });
      if (firstCoupon) {
        discountPercent = firstCoupon.discountPercent;
        appliedCoupon = firstCoupon._id;
      }
    }

    // If user provided a coupon code, validate and apply
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (
        coupon &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
      ) {
        discountPercent = Math.max(discountPercent, coupon.discountPercent);
        appliedCoupon = coupon._id;
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    // Calculate discounted amount
    let amount = total_fare;
    if (discountPercent > 0) {
      amount = amount - (amount * discountPercent) / 100;
    }

    // Create booking
    const booking = new Booking({
      user_id,
      trip_id,
      seat_numbers,
      total_fare: amount,
      booking_channel,
      payment_id,
      coupon: appliedCoupon,
    });
    await booking.save();
    res.status(201).json({ booking, discountPercent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
