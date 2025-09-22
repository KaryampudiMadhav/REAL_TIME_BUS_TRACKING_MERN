import Booking from "../models/booking.model.js";
import Trip from "../models/trip.model.js";
import Coupon from "../models/coupon.model.js";
import { sendBookingConfirmationEmail } from "./email.controller.js";

// Helper: Check if user is first-time booker
async function isFirstTimeUser(userId) {
  const count = await Booking.countDocuments({ user_id: userId });
  return count === 0;
}
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.user_id.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    booking.status = "CANCELLED_BY_USER";
    await booking.save();
    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.user._id });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const createOnlineBooking = async (req, res) => {
  try {
    const { trip_id, seat_numbers, couponCode } = req.body;
    const user = req.user; // Get user object from 'protect' middleware

    // 1. Fetch trip and all related data efficiently
    const trip = await Trip.findById(trip_id)
      .populate("route_id")
      .populate("vehicle_id");

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // 2. Check for available ONLINE seats
    const availableOnlineSeats =
      trip.seat_allocation.online - trip.tickets_booked.online;
    if (seat_numbers.length > availableOnlineSeats) {
      return res.status(400).json({
        message: `Only ${availableOnlineSeats} online seats available.`,
      });
    }

    // 3. Calculate fare and apply any valid coupons
    const distance = trip.route_id.distance_km;
    const ratePerKm = 2.5; // In a real app, this rate would depend on the service_type
    let total_fare = distance * ratePerKm * seat_numbers.length;

    let discountAmount = 0;
    let appliedCouponId = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        is_active: true,
      });
      if (coupon && new Date() < coupon.expiry_date) {
        // (Add other validation here, e.g., check usage limits)
        if (coupon.discount_type === "PERCENTAGE") {
          discountAmount = (total_fare * coupon.discount_value) / 100;
        } else {
          discountAmount = coupon.discount_value;
        }
        appliedCouponId = coupon._id;
      }
    }

    const finalAmount = total_fare - discountAmount;
    const payment_id = `static_payment_${new Date().getTime()}`; // Dummy ID as requested

    // 4. Create the final booking document
    const booking = await Booking.create({
      trip_id,
      user_id: user._id,
      seat_numbers,
      total_fare: finalAmount,
      discount_amount: discountAmount,
      coupon_id: appliedCouponId,
      payment_id: payment_id,
      booking_channel: "ONLINE",
    });

    // 5. Update the trip's ONLINE booked seat count
    trip.tickets_booked.online += seat_numbers.length;
    await trip.save();

    await sendBookingConfirmationEmail(user.email, {
      passengerName: user.name,
      routeName: trip.route_id.name,
      departureDateTime: trip.departure_time,
      seatNumbers: seat_numbers.join(", "),
      totalFare: finalAmount,
      bookingId: booking._id,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?data=${booking._id}`,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const createOfflineBooking = async (req, res) => {
  try {
    const { trip_id, seat_numbers } = req.body;
    const staff_user = req.user; // Get conductor's user object from middleware

    const trip = await Trip.findById(trip_id)
      .populate("route_id")
      .populate("vehicle_id");
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // 1. Check for available OFFLINE seats
    const availableOfflineSeats =
      trip.seat_allocation.offline - trip.tickets_booked.offline;
    if (seat_numbers.length > availableOfflineSeats) {
      return res.status(400).json({
        message: `Only ${availableOfflineSeats} offline seats available.`,
      });
    }

    // 2. Calculate fare (no coupons for offline sales)
    const distance = trip.route_id.distance_km;
    const ratePerKm = 2.5;
    const total_fare = distance * ratePerKm * seat_numbers.length;

    // 3. Create the booking document
    const booking = await Booking.create({
      trip_id,
      user_id: null, // No passenger user for offline sales
      seat_numbers,
      total_fare,
      payment_id: null, // No online payment
      booking_channel: "OFFLINE",
    });

    // 4. Update the trip's OFFLINE booked seat count
    trip.tickets_booked.offline += seat_numbers.length;
    await trip.save();

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
