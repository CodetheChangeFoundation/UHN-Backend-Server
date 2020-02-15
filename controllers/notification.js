import * as expo_server from "../services/expo-server"

const expo = expo_server.getExpoInstance();

// FOR TESTING ONLY
async function testSendNotification(req, res) {
  let messages = [];

  let pushToken = "ExponentPushToken[mEiEApFpH6WZUECqaSlWXk]"

  messages.push({
    to: pushToken,
    sound: "default",
    body: "test notification",
    data: { some: "data" }
  })

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
       } catch (error) {
        console.error(error);
      }
    }
  })();

  res.status(200).send("OK")
}

module.exports = {
  testSendNotification
}