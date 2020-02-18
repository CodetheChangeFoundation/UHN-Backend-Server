import * as mongoose from "../database/mongoose";
import * as expo_server from "./expo-server";
import * as metrics from "../database/postgres"

function initialize() {
  // Start database connection procedure
  mongoose.connect();
  // Start Expo SDK server for notification handling
  expo_server.connect();
  // Start postgreSQL connection procedure
  metrics.connect();
}

module.exports = {
  initialize
}