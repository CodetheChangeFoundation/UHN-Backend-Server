import * as database from "../database/database";
import * as expo_server from "./expo-server";
import * as metrics from "../database/postgres"

function initialize() {
  // Start database connection procedure
  database.connect();
  // Start Expo SDK server for notification handling
  expo_server.connect();
  // Start postgreSQL connection procedure
  metrics.connect();
}

module.exports = {
  initialize
}