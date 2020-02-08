let alarmService = require("../Services/alarmMetricService");
let findUserID = require("../Services/userMetricService").getUserID;
const handle = require("../Utils/error_handling");

async function alarmStart(req, res) {
  let data = req.body;

  let userID = null;
  try {
    userID = await findUserID(data.username);
    if (userID.length === 1) {
      userID = userID[0].id;
    } else {
      handle.notFound(res, "Cannot find userID for username")
    }

    let alarmID = await alarmService.createAlarmLog(userID, data.startTime, data.endTime);
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

async function alarmUpdate(req, res) {
  let data = req.body;
  let id = req.params.id;
  
  let result = {};
  let updatedField = null;

  if (data.sentStatus) {
    try {
      updatedField = await alarmService.updateAlarmSent(id, data.sentStatus);
      if (updatedField.length === 1) {
        result.alarmStatus = updatedField[0];
      } else {
        handle.notFound("Cannot find alarm log with given ID");
      }
    } catch (err) {
      handle.internalServerError(res, "Cannot update alarm sent status");
    }
  }

  if (data.newEndTime) {
    try {
      updatedField = await alarmService.updateAlarmEndTime(id, data.newEndTime);
      if (updatedField.length === 1) {
        result.alarmEnd = updatedField[0];
      } else {
        handle.notFound("Cannot find alarm log with given ID");
      }
    } catch (err) {
      handle.internalServerError(res, "Cannot update alarm end time");
    }
  }

  res.status(200).json(result);
}

async function extendAlarm(alarmID, newTime) {
  try {
    let updated = await alarmService.updateAlarmEndTime(alarmID, newTime);

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
    let updated = await alarmService.updateAlarmSent(data.alarmID, data.sentStatus);
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
  alarmUpdate
}