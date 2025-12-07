import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient_role: {
      type: String,
      enum: ["ADMIN", "MUNICIPAL", "DRIVER"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    // Optional: A link to take the user to when they click the notification
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
