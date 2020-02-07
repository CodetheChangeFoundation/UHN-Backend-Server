const alarmModel = require("../Models/alarm");
const handle = require("../Utils/error_handling");

async function alarmStart(req, res) {
  let data = req.body;
  try {
    let alarmID = await alarmModel.createAlarmLog(data.username, data.startTime, data.endTime);
    console.log(alarmID);
    res.status(200).json({
      success: true,
      message: "Successfully created alarm log for user",
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
    let updated = await alarmModel.updateAlarmEndTime(data.alarmID, data.newEnd);

    if (updated.length === 1) {
      res.status(200).json({
        success: true,
        message: "Successfully updated alarm log time"
      })
    } else {
      handle.notFound("Cannot find alarm log with given ID");
    }
  } catch (err) {
    handle.internalServerError(res, "Cannot update alarm end time");
  }
}

async function alarmStatusSet(req, res) {
  let data = req.body;
  try {
    let updated = await alarmModel.updateAlarmSent(data.alarmID, data.sentStatus);
    if (updated.length === 1) {
      res.status(200).json({
        success: true,
        message: "Successfully updated alarm sent status"
      })
    } else {
      handle.notFound("Cannot find alarm log with given ID");
    }
  } catch (err) {
    handle.internalServerError(res, "Cannot update alarm log sent state");
  }
}

module.exports = {
  alarmStart,
  extendAlarm,
  alarmStatusSet
}