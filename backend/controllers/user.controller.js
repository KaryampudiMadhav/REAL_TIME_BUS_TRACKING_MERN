import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} from "../mails/mailFunctions.js"; // Using our new email controller
import { generateTokenAndSetCookies } from "../utils/generateTokenandSetCookies.js";

export const signUp = async (req, res) => {
  const { fullName, email, password, contact_number, role } = req.body;
  if (!fullName || !email || !password || !contact_number) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required." });
  }
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists." });
    }

    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      contact_number,
      role: role || "PASSENGER", // Default role is PASSENGER
    });

    // --- NEW LOGIC ADDED HERE ---
    if (newUser.role === "PASSENGER") {
      // Logic for passengers: send verification email
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      newUser.verificationToken = verificationToken;
      newUser.verificationTokenExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

      await newUser.save();
      await sendVerificationEmail(newUser.email, verificationToken);

      res.status(201).json({
        success: true,
        message:
          "User registered. Please check your email to verify your account.",
      });
    } else {
      // Logic for ADMIN, DRIVER, etc: auto-verify them
      newUser.isVerified = true;
      await newUser.save();

      await sendWelcomeEmail(newUser.email, newUser.fullName);

      newUser.password = undefined; // Hide password from response
      res.status(201).json({
        success: true,
        message: `New ${newUser.role.toLowerCase()} created and verified successfully.`,
        user: newUser,
      });
    }
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

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcryptjs.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }
    user.lastLogin = new Date();
    await user.save();

    const token = generateTokenAndSetCookies(res, user._id, user.role);
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // We send a success message even if the user isn't found
      // This prevents people from checking if an email is registered.
      return res.status(200).json({
        success: true,
        message:
          "If a user with that email exists, a reset link has been sent.",
      });
    }

    // 1. Generate the original token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // 2. Hash the token and save it to the database
    user.password_reset_token = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.password_reset_expires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // 3. Create the reset URL with the original (un-hashed) token
    const resetUrl = `${process.env.APP_URL}/reset-password/${resetToken}`;

    // 4. Send the email
    await sendPasswordResetEmail(user.email, resetUrl);

    res
      .status(200)
      .json({ success: true, message: "Password reset link sent." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // 1. Hash the incoming token from the URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Find the user by the HASHED token and check if it has not expired
    const user = await User.findOne({
      password_reset_token: hashedToken,
      password_reset_expires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Token is invalid or has expired." });
    }

    // 3. Set the new password (and hash it as per your preference)
    const salt = await bcryptjs.genSalt(12);
    user.password = await bcryptjs.hash(password, salt);

    // 4. Clear the reset token fields
    user.password_reset_token = undefined;
    user.password_reset_expires = undefined;

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
