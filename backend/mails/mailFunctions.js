import sendEmail from "../mails/mailsSending.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  TICKET_CONFIRMATION_TEMPLATE,
  REFUND_CONFIRMATION_TEMPLATE,
} from "../mails/templates.js";
export const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const html = VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      verificationCode
    );
    await sendEmail({
      to: email,
      subject: "Verify Your Email for Bus Tracking App",
      html,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    let html = WELCOME_EMAIL_TEMPLATE;
    html = html.replace(/{name}/g, name);
    html = html.replace("{appLoginUrl}", process.env.CLIENT_URL);
    html = html.replace("{imageUrl}", "../seeds/logo.png");
    await sendEmail({
      to: email,
      subject: `Welcome, ${name}!`,
      html,
    });
  } catch (error) {
    console.error(`Error sending welcome email`, error);
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
      "{resetURL}",
      resetUrl
    );
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

export const sendPasswordResetSuccessEmail = async (email) => {
  try {
    await sendEmail({
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });
  } catch (error) {
    console.error("Error sending password reset success email:", error);
  }
};

export const sendBookingConfirmationEmail = async (email, bookingDetails) => {
  try {
    let html = TICKET_CONFIRMATION_TEMPLATE;

    // Replace all placeholders with actual data
    html = html.replace("{passengerName}", bookingDetails.passengerName);
    html = html.replace("{routeName}", bookingDetails.routeName);
    html = html.replace(
      "{departureDateTime}",
      bookingDetails.departureDateTime
    );
    html = html.replace("{seatNumbers}", bookingDetails.seatNumbers);
    html = html.replace("{totalFare}", bookingDetails.totalFare);
    html = html.replace("{bookingId}", bookingDetails.bookingId);
    html = html.replace("{qrCodeUrl}", bookingDetails.qrCodeUrl);

    await sendEmail({
      to: email,
      subject: `Booking Confirmed: ${bookingDetails.routeName}`,
      html,
    });
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
  }
};

export const sendRefundEmail = async (email, refundDetails) => {
  try {
    let html = REFUND_CONFIRMATION_TEMPLATE;

    html = html.replace("{passengerName}", refundDetails.passengerName);
    html = html.replace("{bookingId}", refundDetails.bookingId);
    html = html.replace("{routeName}", refundDetails.routeName);
    html = html.replace("{refundAmount}", refundDetails.refundAmount);
    html = html.replace("{refundId}", refundDetails.refundId);

    await sendEmail({
      to: email,
      subject: `Refund Processed for Booking #${refundDetails.bookingId}`,
      html,
    });
  } catch (error) {
    console.error("Error sending refund email:", error);
  }
};
