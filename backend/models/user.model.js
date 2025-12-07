import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // --- Core Identity Fields ---
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    contact_number: {
      type: String,
      required: [true, "Contact number is required"],
      match: [
        /^(?:\+91)?[6-9]\d{9}$/,
        "Please provide a valid 10-digit Indian mobile number",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Prevents password from being sent in API responses
    },

    // Authorization & Profile removed: user model is now only for passengers
    profile_picture_url: {
      type: String,
      default: "",
    },

    // --- Verification Status ---
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiresAt: {
      type: Date,
      select: false,
    },
    is_phone_verified: {
      type: Boolean,
      default: false,
    },
    phone_otp: {
      type: String,
      select: false,
    },
    phone_otp_expires_at: {
      type: Date,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
    },
    passwordAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date, // This is set by the login controller
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
