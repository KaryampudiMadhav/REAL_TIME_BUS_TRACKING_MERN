// models/staff.model.js
import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    // user_id removed: staff and user are now separate entities
    employee_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "MUNICIPAL", "DRIVER", "CONDUCTOR"],
      required: true,
      description: "Staff role: ADMIN, MUNICIPAL, DRIVER, or CONDUCTOR",
    },
    depot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Depot", // Associates staff with a specific depot
    },
    date_of_joining: {
      type: Date,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true, // Allows admin to mark an employee as currently employed
    },
    is_on_duty: {
      type: Boolean,
      default: false, // True if staff is currently assigned to work
    },
    // --- Contact & Address ---
    work_contact_number: {
      type: String,
      required: true,
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    license_details: {
      number: {
        type: String,
      },
      expiry_date: {
        type: Date,
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
