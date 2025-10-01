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
  res.clearCookie("jwt");
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

    if (!from || !to || !date) {
      return res.status(400).json({
        message: "Source (from), destination (to), and date are required.",
      });
    }

    // --- 1. Find all routes that contain BOTH stops in the correct order ---
    const matchingRoutes = await Route.aggregate([
      // Stage 1: Quickly find routes that contain both stop names (case-insensitive).
      {
        $match: {
          "stops.name": { $all: [new RegExp(from, "i"), new RegExp(to, "i")] },
        },
      },
      // Stage 2: Create fields with the array index of the 'from' and 'to' stops.
      {
        $addFields: {
          startIndex: { $indexOfArray: ["$stops.name", new RegExp(from, "i")] },
          endIndex: { $indexOfArray: ["$stops.name", new RegExp(to, "i")] },
        },
      },
      // Stage 3: Keep only the routes where the 'from' stop appears BEFORE the 'to' stop.
      {
        $match: {
          $expr: { $lt: ["$startIndex", "$endIndex"] },
        },
      },
    ]);

    if (matchingRoutes.length === 0) {
      return res.status(200).json([]); // No routes found, return an empty array.
    }

    // --- 2. Find all available trips for those routes on the specified date ---
    const routeIds = matchingRoutes.map((route) => route._id);

    // Create a date range for the entire selected day
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const availableTrips = await Trip.find({
      route_id: { $in: routeIds },
      status: { $in: ["SCHEDULED", "DELAYED"] }, // Only show trips that can still be booked
      departure_datetime: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ departure_datetime: 1 }) // Show earliest trips first
      .populate("vehicle_id", "bus_number service_type amenities total_seats")
      .populate("route_id"); // Populate the full route details

    res.status(200).json(availableTrips);
  } catch (error) {
    console.error("Advanced search error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
