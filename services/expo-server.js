import { Expo } from "expo-server-sdk";

let connected = false;
var expo = null;

function connect() {
  expo = new Expo();
  console.log("connected to Expo Server SDK")
  connected = true;
}

function getExpoInstance() {
  return expo;
}

function isConnected() {
  return connected;
}

module.exports = {
  isConnected,
  connect,
  getExpoInstance,
}