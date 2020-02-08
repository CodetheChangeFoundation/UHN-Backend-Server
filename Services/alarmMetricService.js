let model = require("../Models/metrics/alarm").alarm;

let metricDB = require("knex")({
  client: "pg",
  connection: process.env.DATABASE_URL
});

async function createAlarmLog(userID, timeStart, timeEnd) {
  let alarmLogID = null;

  try {
    await metricDB("alarmlog").insert({
      userid: parseInt(userID),
      alarmstart: timeStart,
      alarmend: timeEnd,
      alarmsent: "FALSE"
    }).returning("*").then(res => {
      console.log(res);
      alarmLogID = res[0].id;
    });

    return alarmLogID;

  } catch (err) {
    throw err;
  }
}

async function updateAlarmEndTime(logID, newTime) {
  let result = null;
  try {
    await metricDB("alarmlog").where({
      id: logID
    }).update({
      alarmend: newTime
    }).returning("alarmend").then(res => {
      console.log(res);
      result = res;
    });

    return result;

  } catch (err) {
    throw err;
  }
}

async function updateAlarmSent(logID, status) {
  let result = null;
  try {
    await metricDB("alarmlog").where({
      id: logID
    }).update({
      alarmsent: status
    }).returning("alarmsent").then(res => {
      console.log(res);
      result = res;
    })

    return result;

  } catch (err) {
    throw err;
  }
}

module.exports = {
  createAlarmLog,
  updateAlarmEndTime,
  updateAlarmSent
}