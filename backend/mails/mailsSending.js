import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 1. Check for Development Mode to avoid spamming or auth errors
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_REAL_EMAILS !== 'true') {
    console.log("------------------------------------------");
    console.log("📧 [DEV MODE] Email Simulation");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log("------------------------------------------");
    return;
  }

  // 2. Create a transporter object using Gmail's SMTP settings
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email from .env
      pass: process.env.EMAIL_PASS, // Your App Password from .env
    },
  });

  // 3. Define the email options
  const mailOptions = {
    from: `Bus Tracking Support <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments, // Support for attachments (e.g. CID images)
  };

  // 4. Send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send email via SMTP:", error.message);
    throw error;
  }
};

export default sendEmail;
