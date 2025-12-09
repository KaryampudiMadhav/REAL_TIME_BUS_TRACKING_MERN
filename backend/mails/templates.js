export const TICKET_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
  
  <div style="background: linear-gradient(to right, #007BFF, #0056b3); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
  </div>
  
  <div style="padding: 20px;">
    <p>Hello <strong>{passengerName}</strong>,</p>
    <p>Your booking is confirmed. Here are the details of your trip:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold;">Route:</td>
        <td style="padding: 10px;">{routeName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold;">Departure:</td>
        <td style="padding: 10px;">{departureDateTime}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold;">Seats:</td>
        <td style="padding: 10px; font-weight: bold; color: #007BFF;">{seatNumbers}</td>
      </tr>
       <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold;">Total Fare:</td>
        <td style="padding: 10px;">₹{totalFare}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Booking ID:</td>
        <td style="padding: 10px;">{bookingId}</td>
      </tr>
    </table>

    <div style="text-align: center; margin: 30px 0;">
        <p style="margin-bottom: 10px;">Show this QR code to the conductor:</p>
        <img src="cid:qrcode" alt="Booking QR Code" style="width: 150px; height: 150px;">
    </div>
    
    <p>We wish you a safe and pleasant journey!</p>
    <p>Best regards,<br>The Bus Tracking Team</p>
  </div>
</body>
</html>
`;
export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>BusNext Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Bus Tracker</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(to right, #007BFF, #0056b3); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to BusNext, {name}!</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {name},</p>
    <p>Thank you for joining our Bus Tracking community! Your email has been successfully verified, and your account is now active.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <img src={imageUrl} alt="Welcome Bus" style="max-width: 150px;">
    </div>

    <p>You can now log in to book tickets, track buses in real-time, and manage your journeys all in one place.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{appLoginUrl}" style="background-color: #007BFF; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Your Dashboard</a>
    </div>
    
    <p>We're excited to make your travel easier.</p>
    <p>Best regards,<br>The Bus Tracking Team</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
export const REFUND_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Refund Processed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">

  <div style="background: linear-gradient(to right, #28a745, #218838); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Refund Processed</h1>
  </div>
  
  <div style="padding: 20px;">
    <p style="font-size: 1.1em;">Hello <strong>{passengerName}</strong>,</p>
    <p>We are writing to confirm that your booking has been cancelled and your refund has been processed successfully.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold;">Original Booking ID:</td>
        <td style="padding: 10px;">{bookingId}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold;">Route:</td>
        <td style="padding: 10px;">{routeName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold;">Refund Amount:</td>
        <td style="padding: 10px; font-weight: bold; color: #28a745;">₹{refundAmount}</td>
      </tr>
       <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; font-weight: bold;">Refund Transaction ID:</td>
        <td style="padding: 10px;">{refundId}</td>
      </tr>
    </table>

    <p>Please note that it may take 5-7 business days for the amount to reflect in your original payment account, depending on your bank's processing times.</p>
    <p>We are sorry to see you go and hope to see you travel with us again soon.</p>
    <p>Best regards,<br>The Bus Tracking Team</p>
  </div>
  
</body>
</html>
`;
