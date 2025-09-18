import sendEmail from "../mails/mailsSending.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
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
