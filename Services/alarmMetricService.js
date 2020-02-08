let model = require("../Models/alarm").alarmMetrics;
const handle = require("../Utils/error_handling");

let metricDB = require("knex")({
  client: "pg",
  connection: process.env.DATABASE_URL
});

async function alarmStart(req, res) {
  let data = req.body;
  try {
    let alarmID = null;
    await metricDB("alarmlog").insert({
      userid: metricDB("users").select("id").where({username: data.username}),
      alarmstart: data.startTime,
      alarmend: data.endTime,
      alarmsent: "FALSE"
    }).returning("*").then(res => {
      alarmID = res[0].id;
    });
    console.log(alarmID);
    res.status(200).json({
      alarmID: alarmID
    });
  } catch (err) {
    console.log(err)
    handle.internalServerError(res, "Cannot create metrics alarm log for user");
  }
}

async function extendAlarm(req, res) {
  let data = req.body;
  try {
    let updated = null;
    await metricDB("alarmlog").where({
      id: data.alarmID
    }).update({
      alarmend: data.newTime
    }).returning("*").then(res => {
      console.log(res);
      updated = res;
    });

    if (updated.length === 1) {
      res.status(200).json({
        success: true,
        message: "Successfully updated alarm log time"
      })
    } else {
      handle.notFound("Cannot find alarm log with given ID");
    }
  } catch (err) {
    console.log(err);
    handle.internalServerError(res, "Cannot update alarm end time");
  }
}

async function alarmStatusSet(req, res) {
  let data = req.body;
  try {
    let updated = null;
    await metricDB("alarmlog").where({
      id: data.alarmID
    }).update({
      alarmsent: data.sentStatus
    }).returning("*").then(res => {
      console.log(res);
      updated = res;
    })
    if (updated.length === 1) {
      res.status(200).json({
        success: true,
        message: "Successfully updated alarm sent status"
      })
    } else {
      handle.notFound("Cannot find alarm log with given ID");
    }
  } catch (err) {
    console.log(err)
    handle.internalServerError(res, "Cannot update alarm log sent state");
  }
}

module.exports = {
  alarmStart,
  alarmStatusSet,
  extendAlarm
}