var expo_server = require("../services/expo-server");
var UserService = require("../services/user.service");
import { Expo } from "expo-server-sdk"

var expo = expo_server.getExpoInstance();

// TODO: Need to handle receipts of notifications, to handle errors
const sendBatchNotifications = async (user, help_request) => {
  let push_tokens = [];
  let notifications = [];
  let responders = user.responders;

  for (let r of responders) {
    let responder = null;

    try {
      responder = await UserService.findUserById(r.id);
      push_tokens.push(responder.push_token);
    } catch (err) {
      console.error(err.message + "\nSkipping to the next one.");
    }
  }

  for (let pt of push_tokens) {
    if (!Expo.isExpoPushToken(pt)) {
      console.error(`Push token ${pt} is not a valid Expo push token`);
      continue;
    }

    let notification = {
      to: pt,
      sound: "default",
      // TODO: Missing location details
      body: `${user.get("username")} is unresponsive. Please help!`,
      // TODO: Pending to change to actual data passed by notification
      data: { user: UserService.cleanUserAttributes(user.toJSON()) }
    };

    notifications.push(notification);
  }

  let chunks = expo.chunkPushNotifications(notifications);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);

    } catch (error) {
      console.error(error);
    }
  }
};

module.exports = {
  sendBatchNotifications
};
