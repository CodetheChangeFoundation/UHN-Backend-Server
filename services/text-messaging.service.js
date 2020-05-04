require("dotenv");

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const sendTemporaryPassword = (phone, temporaryPassword) => {
  twilio.messages
    .create({
      body: `You have requested a temporary password: ${temporaryPassword}`,
      from: TWILIO_PHONE_NUMBER,
      to: `+1${phone}`,
    })
    .then((message) => console.log(`Message sent: ${message.sid}`))
    .catch((err) =>
      console.error(
        `TextMessagingService sendTemporaryPassword error: ${err.message}`
      )
    );
};

module.exports = {
  sendTemporaryPassword,
};
