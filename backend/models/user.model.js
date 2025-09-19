// models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // --- Core Identity Fields ---
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    // Unique ID for admin login
    admin_id: {
      type: String,
      unique: true,
      sparse: true, // Only required for admin
      trim: true,
    },
    // Unique ID for municipal login
    municipal_id: {
      type: String,
      unique: true,
      sparse: true, // Only required for municipal
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [120, "Age seems unrealistic"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Prevents the password from being sent back in queries by default
    },
    contact_number: {
      type: String,
      required: [true, "Contact number is required"],
    },
    // aadhaar_number: {
    //   type: String,
    //   unique: true,
    //   match: [/^\d{12}$/, "Aadhaar number must be exactly 12 digits."],
    // },
    // --- Authorization & Status ---
    role: {
      type: String,
      required: true,
      enum: {
        values: ["PASSENGER", "DRIVER", "CONDUCTOR", "ADMIN", "MUNICIPAL"],
        message: "{VALUE} is not a supported role",
      },
    },
    is_active: {
      type: Boolean,
      default: true, // Allows an admin to deactivate an account
    },

    // --- Optional Profile Fields ---
    profile_picture_url: {
      type: String,
      default: "",
    },
    // --- Summary Data (updated by server logic for performance) ---
    total_journeys: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now(),
    },
    password_reset_token: String,
    password_reset_expires: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
