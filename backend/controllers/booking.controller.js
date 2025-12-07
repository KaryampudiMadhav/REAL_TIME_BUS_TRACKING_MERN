import Booking from "../models/booking.model.js";
import Trip from "../models/trip.model.js";
import Coupon from "../models/coupon.model.js";
import qrcode from "qrcode";
import {
  sendBookingConfirmationEmail,
  sendRefundEmail,
} from "../mails/mailFunctions.js";

export const getSeatAvailability = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId).populate("vehicle_id");
    if (!trip) return res.status(404).json({ error: "Trip not found." });

    const serviceType = trip.vehicle_id.service_type;
    let availableSeatsOrTickets = {};

    if (serviceType === "Palle Velugu" || serviceType === "Express") {
      availableSeatsOrTickets = {
        type: "tickets",
        available:
          trip.seat_allocation.online +
          trip.seat_allocation.offline -
          (trip.tickets_booked.online + trip.tickets_booked.offline),
      };
    } else {
      availableSeatsOrTickets = {
        type: "seats",
        bookedSeats: trip.booked_seats || [], // These are permanently booked
        availableOnlineQuota:
          trip.seat_allocation.online - trip.tickets_booked.online,
      };
    }

    res.status(200).json({
      serviceType: serviceType,
      departureTime: trip.departure_datetime,
      ...availableSeatsOrTickets,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const calculateFare = async (req, res) => {
  try {
    const { trip_id, seat_numbers, ticketCount, couponCode } = req.body;
    const trip = await Trip.findById(trip_id)
      .populate("route_id")
      .populate("vehicle_id");
    if (!trip) return res.status(404).json({ error: "Trip not found." });

    const serviceType = trip.vehicle_id.service_type;
    const numToBook =
      serviceType === "Palle Velugu" || serviceType === "Express"
        ? ticketCount || 1
        : seat_numbers?.length || 0;

    if (numToBook === 0)
      return res
        .status(400)
        .json({ error: "No seats or tickets selected for fare calculation." });

    const ratePerKm = 2.5; // This should come from a config based on service_type
    let baseFare = trip.route_id.distance_km * ratePerKm * numToBook;
    let discountAmount = 0;

    // --- COUPON LOGIC (EXAMPLE - EXPAND AS NEEDED) ---
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });
      // Add more sophisticated checks here: usage limits, expiry, user specific usage, etc.
      if (coupon && new Date() < coupon.expiresAt) {
        // Assuming discountPercent is a direct percentage value
        discountAmount = (baseFare * coupon.discountPercent) / 100;
      }
    }
    // --- END COUPON LOGIC ---

    const finalFare = baseFare - discountAmount;

    res.status(200).json({
      baseFare,
      discountAmount,
      finalFare,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createOnlineBooking = async (req, res) => {
  try {
    const { trip_id, seat_numbers, ticketCount, couponCode, passengers } = req.body;
    const user = req.user;
    const io = req.app.get("socketio"); // Get the io instance

    const trip = await Trip.findById(trip_id)
      .populate("route_id")
      .populate("vehicle_id");
    if (!trip) return res.status(404).json({ error: "Trip not found." });

    // 1. VALIDATION: Check if trip is still open for booking
    if (trip.status !== "SCHEDULED") {
      return res
        .status(400)
        .json({ error: "Booking is closed for this trip." });
    }

    // 2. Determine booking type and validations
    const serviceType = trip.vehicle_id.service_type;
    let numItemsToBook = 0; // Can be seats or tickets
    let actualSeatNumbers = []; // Only for seat-allocated buses

    if (serviceType === "Palle Velugu" || serviceType === "Express") {
      // Ticket-only booking
      numItemsToBook = parseInt(ticketCount, 10) || 1;
      // ... existing validations ...
      if (numItemsToBook <= 0)
        return res
          .status(400)
          .json({ error: "Please specify a valid number of tickets." });
      if (numItemsToBook > 6)
        return res.status(400).json({
          error: "You can book a maximum of 6 tickets per transaction.",
        });

      const availableOnlineTickets =
        trip.seat_allocation.online - trip.tickets_booked.online;
      if (numItemsToBook > availableOnlineTickets) {
        return res.status(400).json({
          message: `Only ${availableOnlineTickets} online tickets available.`,
        });
      }
      actualSeatNumbers = [];
    } else {
      // Seat-allocation booking
      if (!seat_numbers || seat_numbers.length === 0)
        return res.status(400).json({ error: "Please select your seats." });
      numItemsToBook = seat_numbers.length;
      if (numItemsToBook > 6)
        return res.status(400).json({
          error: "You can book a maximum of 6 seats per transaction.",
        });

      // Check if selected seats are already permanently booked
      const alreadyBooked = seat_numbers.filter((seat) =>
        trip.booked_seats.includes(seat)
      );
      if (alreadyBooked.length > 0) {
        return res.status(400).json({
          error: `Seats ${alreadyBooked.join(
            ", "
          )} are already permanently booked.`,
        });
      }

      const availableOnlineSeats =
        trip.seat_allocation.online - trip.tickets_booked.online;
      if (numItemsToBook > availableOnlineSeats) {
        return res.status(400).json({
          message: `Only ${availableOnlineSeats} online seats available.`,
        });
      }
      actualSeatNumbers = seat_numbers;
    }

    // NEW: Validate Passengers Array
    if (!passengers || !Array.isArray(passengers) || passengers.length !== numItemsToBook) {
      // Fallback for backward compatibility or if frontend sends incomplete data
      // Ideally, return error, but for now let's be strict as per requirement
      return res.status(400).json({ error: `Please provide details for all ${numItemsToBook} passengers.` });
    }


    // 3. FARE CALCULATION & PAYMENT (using the helper logic)
    const ratePerKm = 2.5;
    let baseFare = trip.route_id.distance_km * ratePerKm * numItemsToBook;
    let discountAmount = 0;
    let appliedCouponId = null;

    // --- COUPON LOGIC ---
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });
      if (coupon && new Date() < coupon.expiresAt) {
        discountAmount = (baseFare * coupon.discountPercent) / 100;
        appliedCouponId = coupon._id;
      }
    }
    // --- END COUPON LOGIC ---

    const finalAmount = baseFare - discountAmount;
    const payment_id = `static_payment_${Date.now()}`; // Dummy ID

    // 4. CREATE BOOKING & QR CODE
    const newBooking = new Booking({
      trip_id,
      user_id: user._id,
      seat_numbers: actualSeatNumbers,
      passengers: passengers, // Save passenger details
      total_fare: finalAmount,
      coupon: appliedCouponId,
      payment_id,
      booking_channel: "ONLINE",
    });
    newBooking.qr_code_data = await qrcode.toDataURL(newBooking._id.toString());

    await newBooking.save();

    // 5. UPDATE TRIP COUNTERS & PERMANENTLY BOOK SEATS (if applicable)
    trip.tickets_booked.online += numItemsToBook;
    if (serviceType !== "Palle Velugu" && serviceType !== "Express") {
      trip.booked_seats.push(...actualSeatNumbers);
    }
    await trip.save();

    // 6. EMIT SOCKET.IO EVENT for seat allocation buses
    if (
      io &&
      serviceType !== "Palle Velugu" &&
      serviceType !== "Express" &&
      actualSeatNumbers.length > 0
    ) {
      const roomName = `seat_selection_${trip_id}`;
      io.to(roomName).emit("seat_update", {
        seatNumbers: actualSeatNumbers,
        status: "booked_permanent",
      });
    }

    // 7. SEND CONFIRMATION EMAIL
    const bookingDetails = {
      passengerName: user.fullName,
      routeName: trip.route_id.routeName,
      departureDateTime: new Date(trip.departure_datetime).toLocaleString(
        "en-IN"
      ),
      seatNumbers:
        actualSeatNumbers.length > 0
          ? actualSeatNumbers.join(", ")
          : `${numItemsToBook} Tickets`,
      totalFare: finalAmount,
      bookingId: newBooking._id.toString(),
      qrCodeUrl: newBooking.qr_code_data,
    };
    await sendBookingConfirmationEmail(user.email, bookingDetails);

    res.status(201).json(newBooking);
  } catch (err) {
    console.error("Error creating online booking:", err);
    res.status(500).json({ error: err.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "trip_id",
        populate: { path: "route_id", select: "routeName" },
      })
      .populate({
        path: "trip_id",
        populate: { path: "vehicle_id", select: "service_type" },
      });

    // 1. Validations
    if (!booking)
      return res.status(404).json({ message: "Booking not found." });
    if (booking.user_id.toString() !== req.user.id)
      return res.status(401).json({ message: "Unauthorized." });
    if (booking.status !== "CONFIRMED")
      return res.status(400).json({ message: "Booking cannot be cancelled." });

    // 2. Process Refund (Dummy example)
    // In a real app, integrate with your payment gateway here
    const mockRefundId = `refund_${Date.now()}`;
    const refundAmount = booking.total_fare; // Simple full refund for now

    // 3. Update Database
    booking.status = "CANCELLED_BY_USER";
    booking.refund = {
      refund_id: mockRefundId,
      amount: refundAmount,
      status: "PROCESSED",
      processed_at: new Date(),
    };
    await booking.save();

    // 4. Update Trip (make seats/tickets available again)
    const trip = await Trip.findById(booking.trip_id._id);
    if (trip) {
      const numCancelled =
        booking.seat_numbers.length > 0 ? booking.seat_numbers.length : 1; // For ticket-only, assume 1 per booking

      trip.tickets_booked.online -= numCancelled;
      if (
        trip.booked_seats &&
        booking.seat_numbers &&
        booking.seat_numbers.length > 0
      ) {
        trip.booked_seats = trip.booked_seats.filter(
          (seat) => !booking.seat_numbers.includes(seat)
        );
      }
      await trip.save();

      // 5. EMIT SOCKET.IO EVENT for seat allocation buses
      const io = req.app.get("socketio");
      if (io && booking.seat_numbers && booking.seat_numbers.length > 0) {
        const roomName = `seat_selection_${trip._id}`;
        io.to(roomName).emit("seat_update", {
          seatNumbers: booking.seat_numbers,
          status: "available",
        });
      }
    }

    // 6. Send the refund confirmation email
    const refundDetails = {
      passengerName: req.user.fullName,
      bookingId: booking._id.toString(),
      routeName: booking.trip_id.route_id.routeName,
      refundAmount: refundAmount,
      refundId: mockRefundId,
    };
    await sendRefundEmail(req.user.email, refundDetails);

    res.status(200).json({
      message: "Booking cancelled and refund processed successfully.",
      booking,
    });
  } catch (error) {
    console.error("Error during cancellation:", error);
    res.status(500).json({
      message: "Server error during cancellation.",
      error: error.message,
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.user.id })
      .populate({
        path: "trip_id",
        populate: [
          { path: "route_id", select: "routeName" },
          { path: "vehicle_id", select: "service_type" },
        ],
      })
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
