// models/staff.model.js
import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    employee_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
