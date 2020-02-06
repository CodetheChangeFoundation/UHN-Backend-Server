let metricDB = require("knex")({
  client: "pg",
  connection: process.env.DATABASE_URL
});

async function createAlarmLog(username, timeStart, timeEnd) {
  let alarmLogID = null;
  try {
    await metricDB("alarmlog").insert({
      userid: metricDB("users").select("id").where({username: username}),
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
  try {
    await metricDB("alarmlog").where({
      id: logID
    }).update({
      alarmend: newTime
    }).returning("*").then(res => {
      console.log(res);
    })
  } catch (err) {
    throw err;
  }
}

async function updateAlarmSent(logID) {
  try {
    await metricDB("alarmlog").where({
      id: logID
    }).update({
      alarmsent: "TRUE"
    })
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createAlarmLog,
  updateAlarmEndTime,
  updateAlarmSent
}