import * as mongoose from "../database/mongoose";
import * as expo_server from "./expo-server";
import * as metrics from "../database/postgres"

var refreshConns = setInterval(function () { initialize(); }, 1000*60);

function initialize() {
  if (!mongoose.isConnected()){
    // Start database connection procedure
    mongoose.connect();
  }
  if (!expo_server.isConnected()) {
    // Start Expo SDK server for notification handling
    expo_server.connect();
  }
  if (!metrics.isConnected()) {
    // Start postgreSQL connection procedure
    metrics.connect();
  }
}

module.exports = {
  initialize,
  refreshConns
}