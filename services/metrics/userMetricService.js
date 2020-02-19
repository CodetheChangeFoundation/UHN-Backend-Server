import UserMetricModel from "../../Models/metrics/user";
import metrics from "../../database/postgres";

let metricDB = metrics.getMetrics();

async function updateUserLoginTime(username){
  let checkExists = null;

  let user = new UserMetricModel(null, null, username, metricDB.fn.now());
  try {
    checkExists = await metricDB("users").where({
      username: user.name
    }).update({
      lastlogin: user.lastLogin
    }).returning("*");

    if (checkExists.length < 1) {
      addNewUserToMetrics(username);
    }

  } catch (err) {
    throw new Error(err.message);
  }
}

async function addNewUserToMetrics(mongoID, username) {
  let user = new UserMetricModel(null, mongoID, username, metricDB.fn.now());
  try {
    await metricDB("users").insert({
      mongoid: user.mongoID.toString(),
      username: user.name,
      lastlogin: user.lastLogin
   }).returning("*");

  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  updateUserLoginTime,
  addNewUserToMetrics
}