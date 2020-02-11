import UserMetricModel from "../Models/metrics/user";

let metricDB = require("knex")({
  client: "pg",
  connection: process.env.DATABASE_URL
});

async function updateUserLoginTime(username){
  let checkExists = null;

  let user = new UserMetricModel(null, username, metricDB.fn.now());
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

async function addNewUserToMetrics(username) {
  let user = new UserMetricModel(null, username, metricDB.fn.now());
  try {
    await metricDB("users").insert({
     username: user.name,
     lastlogin: user.lastLogin
   }).returning("*").then(res => {
     console.log(res);
   })
  } catch (err) {
    throw err;
  }
}

async function getUserID(username) {
  let foundID = null;
  
  let user = new UserMetricModel(null, username, null);
  try {
    await metricDB("users").where({
      username: user.name
    }).returning("*").then(res => {
      console.log(res);
      foundID = res;
    })
  } catch (err) {
    throw err;
  }

  return foundID;
}

module.exports = {
  updateUserLoginTime,
  addNewUserToMetrics,
  getUserID
}