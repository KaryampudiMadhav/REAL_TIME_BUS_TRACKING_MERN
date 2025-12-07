import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function sendSMS(to, message) {
  return client.messages.create({
    body: message,
    from: twilioNumber,
    to: to,
  });
}
