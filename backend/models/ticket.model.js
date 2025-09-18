// models/supportTicket.model.js
import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    // Link to the user who created the ticket.
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional: Link to the trip the user was having trouble with.
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },

    // --- Ticket Details ---
    category: {
      type: String,
      required: true,
      enum: [
        "PAYMENT_ISSUE",
        "BOOKING_FAILED",
        "UI_ERROR",
        "GENERAL_QUERY",
        "OTHER",
      ],
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    // --- Management Status ---
    // This helps the admin track the ticket's lifecycle.
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },

    // Stores replies or internal notes from the admin, creating a message thread.
    admin_notes: [
      {
        admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // `createdAt` will be the time the ticket was created.
  }
);

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
export default SupportTicket;
