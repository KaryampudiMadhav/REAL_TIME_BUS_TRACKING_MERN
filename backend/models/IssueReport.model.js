// models/issueReport.model.js
import mongoose from "mongoose";

const issueReportSchema = new mongoose.Schema(
  {
    // --- Links to other models ---
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip", // Links to the specific trip that has an issue
      required: true,
    },
    reported_by_staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // Links to the employee who reported it
      required: false, // Changed to false to allow System generated alerts
    },

    // --- Report Details ---
    issue_type: {
      type: String,
      enum: ["BREAKDOWN", "TRAFFIC", "ACCIDENT", "PUNCTURE", "OTHER"],
      required: true,
    },
    message: {
      type: String, // This will store the transcribed voice message or text from the driver's app
      required: true,
    },

    // --- Management Status (The Change) ---
    // This helps the admin track the issue's lifecycle.
    status: {
      type: String,
      enum: ["NEW", "VIEWED", "IN_PROGRESS", "RESOLVED", "VERIFIED", "REJECTED"],
      default: "NEW",
    },
    is_verified: {
      type: Boolean,
      default: false
    },
    admin_verification_note: {
      type: String,
      default: ""
    }
  },
  {
    // Automatically adds a `createdAt` timestamp, which is the time of the report.
    timestamps: true,
  }
);

const IssueReport = mongoose.model("IssueReport", issueReportSchema);
export default IssueReport;
