import UserMetricModel from "../../models/metrics/user";
import metrics from "../../database/postgres";

let metricDB = metrics.getMetrics();

async function updateUserLoginTime(username){
  let checkExists = null;

  let user = new UserMetricModel(null, null, username, metricDB.fn.now());
  try {
    await metricDB("users").where({
      username: user.name
    }).update({
      lastlogin: user.lastLogin
    }).returning("*").then(res => {
      checkExists = res;
      console.log(checkExists);

      if (checkExists.length < 1) {
        addNewUserToMetrics(username);
      }
    });

  } catch (err) {
    throw err;
  }
}

async function addNewUserToMetrics(mongoID, username) {
  let user = new UserMetricModel(null, mongoID, username, metricDB.fn.now());
  try {
    await metricDB("users").insert({
      mongoid: user.mongoID.toString(),
      username: user.name,
      lastlogin: user.lastLogin
   }).returning("*").then(res => {
      console.log(res);
   })
  } catch (err) {
    throw err;
  }
}

module.exports = {
  updateUserLoginTime,
  addNewUserToMetrics
}