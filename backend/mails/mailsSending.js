import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 1. Create a transporter object using Gmail's SMTP settings
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email from .env
      pass: process.env.EMAIL_PASS, // Your App Password from .env
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: `Bus Tracking Support <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
