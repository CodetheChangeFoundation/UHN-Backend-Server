import * as database from "../database/database";
import * as expo_server from "./expo-server";

function initialize() {
  // Start database connection procedure
  database.connect();
  // Start Expo SDK server for notification handling
  expo_server.connect();
}

module.exports = {
  initialize
}