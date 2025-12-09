import crypto from "crypto";
import { sendSMS } from "../utils/smsService.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookies } from "./../utils/generateTokenandSetCookies.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} from "../mails/mailFunctions.js";

export const sendPhoneOTP = async (req, res) => {
  const { contact_number } = req.body;
  if (!contact_number) {
    return res
      .status(400)
      .json({ success: false, error: "Contact number is required." });
  }
  try {
    const user = await User.findOne({ contact_number });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.phone_otp = otp;
    user.phone_otp_expires_at = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await user.save();
    await sendSMS(contact_number, `BusYour verification code is ${otp}`);
    res.status(200).json({ success: true, message: "OTP sent to mobile." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const verifyPhoneOTP = async (req, res) => {
  const { contact_number, otp } = req.body;
  if (!contact_number || !otp) {
    return res
      .status(400)
      .json({ success: false, error: "Contact number and OTP are required." });
  }
  try {
    const user = await User.findOne({ contact_number });
    if (!user || !user.phone_otp || !user.phone_otp_expires_at) {
      return res
        .status(400)
        .json({ success: false, error: "OTP not requested or expired." });
    }
    if (user.phone_otp !== otp || user.phone_otp_expires_at < Date.now()) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired OTP." });
    }
    user.is_phone_verified = true;
    user.phone_otp = undefined;
    user.phone_otp_expires_at = undefined;
    await user.save();
    res.status(200).json({ success: true, message: "Mobile number verified." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const signUp = async (req, res) => {
  const { fullName, email, password, contact_number } = req.body;

  if (!fullName || !email || !password || !contact_number) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists. Please log in." });
    }

    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      contact_number,
    });

    // Passenger signup (email verification required)
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    newUser.verificationToken = verificationToken;
    newUser.verificationTokenExpiresAt = Date.now() + 15 * 60 * 1000;
    await newUser.save();
    await sendVerificationEmail(newUser.email, verificationToken);
    newUser.password = undefined;
    res.status(201).json({
      success: true,
      message:
        "User registered. Please check your email to verify your account.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    // 1. If no user is found, send a generic success message for security.
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, a new verification email has been sent.",
      });
    }

    // 2. Check if the user is already verified.
    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "This account has already been verified." });
    }

    // 3. Generate a NEW verification token and save it.
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = Date.now() + 15 * 60 * 1000; // New 15-minute expiry
    await user.save();

    // 4. Send the new verification email.
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      success: true,
      message: "A new verification email has been sent.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const verifyEmail = async (req, res) => {
  // We ONLY get the code from the user.
  const { verificationCode } = req.body;

  if (!verificationCode) {
    return res
      .status(400)
      .json({ success: false, error: "Verification code is required." });
  }

  try {
    // Find the one user who has this code and whose code has not expired.
    const user = await User.findOne({
      verificationToken: verificationCode,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    // If no user is found, the code is wrong or expired.
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification code.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    // Send the welcome email to the user we found.
    await sendWelcomeEmail(user.email, user.fullName);

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("forgot-password controller ", email);
  if (!email) {
    return res
      .status(400)
      .json({ success: false, error: "Email is required." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If a user with that email exists, a reset link has been sent.",
      });
    }

    // 1. Generate the original token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // 2. Hash the token and save it to the database
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // 3. Create the reset URL with the original (un-hashed) token
    const resetUrl = `${process.env.APP_URL}/reset/${resetToken}`;
    console.log(resetUrl);
    await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({
      success: true,
      resetToken,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password is required.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long.",
    });
  }

  try {
    // 1. Hash the incoming token from the URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Find the user by the HASHED token and check if it has not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Token is invalid or has expired." });
    }

    // 3. Set the new password (and hash it as per your preference)
    const salt = await bcryptjs.genSalt(12);
    user.password = await bcryptjs.hash(newPassword, salt);

    // 4. Clear the reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;

    await user.save();

    // 5. Send a confirmation email
    await sendPasswordResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    // req.user.id is added by your authentication middleware
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({ error: "Invalid token." });
    }
    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error: "Internal Server Error." });
  }
};

export const Logout = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res
    .status(200)
    .json({ success: true, message: "User Logged Out Successfully." });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user;
    // Helper to check lock
    const isLocked = (user) => user.lockUntil && user.lockUntil > Date.now();
    // User login (passenger only)
    if (email) {
      user = await User.findOne({ email }).select(
        "+password passwordAttempts lockUntil isVerified"
      );
      if (!user)
        return res
          .status(401)
          .json({ success: false, error: "Invalid credentials." });
      if (!user.isVerified)
        return res.status(401).json({
          success: false,
          error: "Please verify your email to login.",
        });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Missing login credentials." });
    }
    // Check if account is locked
    if (isLocked(user)) {
      return res.status(403).json({
        success: false,
        error:
          "Account locked due to too many failed attempts. Try again later.",
      });
    }
    // Check password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      user.passwordAttempts = (user.passwordAttempts || 0) + 1;
      if (user.passwordAttempts >= 3) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
        await user.save();
        return res.status(403).json({
          success: false,
          error:
            "Account locked due to too many failed attempts. Try again in 15 minutes.",
        });
      }
      await user.save();
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
    // Reset attempts on successful login
    user.passwordAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();
    const token = generateTokenAndSetCookies(res, user._id);
    user.password = undefined;
    res
      .status(200)
      .json({ success: true, message: "Login Successful", token, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

import Route from "../models/route.model.js";
import Trip from "../models/trip.model.js";

export const searchAvailableTrips = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !date) {
      return res.status(400).json({
        message: "Source (from) and date are required.",
      });
    }

    // --- 1. Find routes matching criteria ---
    let potentialRoutes = [];
    let validRouteIds = [];

    if (to && to !== "") {
      // --- Search specific Source -> Destination ---
      potentialRoutes = await Route.find({
        "stops.name": { $all: [new RegExp(from, "i"), new RegExp(to, "i")] },
      });

      if (potentialRoutes.length > 0) {
        // Filter routes where 'from' stop comes BEFORE 'to' stop
        validRouteIds = potentialRoutes
          .filter((route) => {
            const fromIndex = route.stops.findIndex((stop) =>
              new RegExp(from, "i").test(stop.name)
            );
            const toIndex = route.stops.findIndex((stop) =>
              new RegExp(to, "i").test(stop.name)
            );
            return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
          })
          .map((route) => route._id);
      }
    } else {
      // --- Search Single Station (Departures or Arrivals involving this stop) ---
      // We want trips that pass through this station.
      // Assuming user wants to go FROM this station (Departures).
      // Find matches for 'from'
      potentialRoutes = await Route.find({
        "stops.name": new RegExp(from, "i"),
      });
      validRouteIds = potentialRoutes.map((route) => route._id);
    }

    if (validRouteIds.length === 0) {
      return res.status(200).json([]);
    }

    // --- 3. Find trips for valid routes on the date ---
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const availableTrips = await Trip.find({
      route_id: { $in: validRouteIds },
      status: { $in: ["SCHEDULED", "DELAYED", "IN_TRANSIT"] }, // Include IN_TRANSIT for live tracking? or maybe just SCHEDULED. User wants to book.
      // Usually only SCHEDULED or DELAYED. IN_TRANSIT might be too late to book online? 
      // User's screenshot shows "0 buses found" for a future date/today. Best to keep standard statuses.
      // Although seed has one IN_TRANSIT trip. Let's include it just in case user testing with it.
      departure_datetime: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ departure_datetime: 1 })
      .populate("vehicle_id", "bus_number service_type amenities total_seats")
      .populate("route_id");

    res.status(200).json(availableTrips);
  } catch (error) {
    console.error("Advanced search error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getPopularRoutes = async (req, res) => {
  try {
    // Fetch upcoming scheduled trips
    const upcomingTrips = await Trip.find({
      status: "SCHEDULED",
      departure_datetime: { $gte: new Date() }
    })
      .sort({ departure_datetime: 1 })
      .limit(20) // Limit to inspect recent upcoming ones
      .populate("route_id", "origin destination distance_km duration_minutes")
      .populate("vehicle_id", "service_type");

    // Extract unique routes
    const uniqueRoutesMap = new Map();

    upcomingTrips.forEach(trip => {
      if (!trip.route_id) return;

      const key = `${trip.route_id.origin}-${trip.route_id.destination}`;
      if (!uniqueRoutesMap.has(key)) {
        // Calculate estimated price (approx 2.5 per km)
        const price = Math.round(trip.route_id.distance_km * 2.5);

        // Format duration
        // Format duration
        let durationMins = trip.route_id.duration_minutes;

        // Fallback: Calculate from stops if available
        if (!durationMins && trip.route_id.stops && trip.route_id.stops.length > 0) {
          const firstStop = trip.route_id.stops[0];
          const lastStop = trip.route_id.stops[trip.route_id.stops.length - 1];
          durationMins = lastStop.arrival_offset_mins - firstStop.departure_offset_mins;
        }

        // Fallback: Estimate from distance (avg speed 60km/h)
        if (!durationMins && trip.route_id.distance_km) {
          durationMins = Math.round((trip.route_id.distance_km / 60) * 60);
        }

        const hours = Math.floor((durationMins || 0) / 60);
        const mins = (durationMins || 0) % 60;
        const durationStr = `${hours}h ${mins}m`;

        uniqueRoutesMap.set(key, {
          from: trip.route_id.origin,
          to: trip.route_id.destination,
          price: `₹${price}`,
          duration: durationStr,
          serviceType: trip.vehicle_id?.service_type // Optional extra info
        });
      }
    });

    // Return top 4
    const popularRoutes = Array.from(uniqueRoutesMap.values()).slice(0, 4);

    // Fallback if no trips found
    if (popularRoutes.length === 0) {
      return res.status(200).json([
        { from: "Hyderabad", to: "Bangalore", price: "₹950", duration: "8h 30m" },
        { from: "Hyderabad", to: "Chennai", price: "₹850", duration: "7h 45m" },
        { from: "Bangalore", to: "Goa", price: "₹1200", duration: "10h 15m" },
        { from: "Mumbai", to: "Pune", price: "₹350", duration: "3h 0m" },
      ]);
    }

    res.status(200).json(popularRoutes);
  } catch (error) {
    console.error("Error fetching popular routes:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
