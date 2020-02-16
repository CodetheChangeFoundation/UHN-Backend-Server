import AlarmMetricModel from "../../Models/metrics/alarm";
import metrics from "../../database/postgres";

let metricDB = metrics.getMetrics();

async function createAlarmLog(userID, timeStart, timeEnd) {
  let alarmLogID = null;

  let alarm = new AlarmMetricModel(null, parseInt(userID), timeStart, timeEnd, false);

  try {
    await metricDB("alarmlog").insert({
      userid: alarm.userid,
      alarmstart: alarm.timeStart,
      alarmend: alarm.timeEnd,
      alarmsent: alarm.wasSent
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

  let alarm = new AlarmMetricModel(logID, null, null, newTime, null);
  try {
    await metricDB("alarmlog").where({
      id: alarm.id
    }).update({
      alarmend: alarm.timeEnd
    }).returning("alarmend").then(res => {
      console.log(res);
      result = res;
    });

    return result;

  } catch (err) {
    let error = new Error("Cannot update alarm end time");
    throw error;
  }
}

async function updateAlarmSent(logID, status) {
  let result = null;

  let alarm = new AlarmMetricModel(logID, null, null, null, status);
  try {
    await metricDB("alarmlog").where({
      id: alarm.id
    }).update({
      alarmsent: alarm.wasSent
    }).returning("alarmsent").then(res => {
      console.log(res);
      result = res;
    })

    return result;

  } catch (err) {
    let error = new Error("Cannot update alarm sent status");
    throw error;
  }
}

module.exports = {
  createAlarmLog,
  updateAlarmEndTime,
  updateAlarmSent
}