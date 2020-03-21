import { Expo } from "expo-server-sdk";

var expo = null;

function connect() {
  expo = new Expo();
  console.log("connected to Expo Server SDK")
}

function getExpoInstance() {
  return expo;
}

module.exports = {
  connect,
  getExpoInstance,
}