let alarmService = require("../../Services/metrics/alarmMetricService");
let findUserID = require("../../Services/metrics/userMetricService").getUserID;
const handle = require("../../Utils/error_handling");

async function alarmStart(req, res) {
  let data = req.body;

  try {
    let alarmID = await alarmService.createAlarmLog(data.userID, data.startTime, data.endTime);
    console.log(alarmID);
    res.status(200).json({
      alarmID: alarmID,
      userID: data.userID,
      startTime: data.startTime,
      endTime: data.endTime
    });
  } catch (err) {
    console.log(err)
    handle.internalServerError(res, "Cannot create metrics alarm log for user");
  }
}

async function alarmUpdate(req, res) {
  let data = req.body;
  let id = req.params.alarmID;
  
  let result = {
    alarmID: id
  };
  
  let updatedStatus = null;
  let updatedTime = null;

  try {
    if (data.sentStatus) {
      updatedStatus = await alarmService.updateAlarmSent(id, data.sentStatus);
    }
    if (data.newEndTime) {
      updatedTime = await alarmService.updateAlarmEndTime(id, data.newEndTime);
    }
  } catch (err) {
    handle.internalServerError(res, err.message)
  }

  if (updatedStatus.length !== 1 && updatedTime.length !== 1) {
    handle.notFound(res, "Cannot find alarm log with given ID");
  }
  
  if (updatedStatus !== null) {
    result.alarmStatus = updatedStatus[0];
  }
  if (updatedTime !== null) {
    result.alarmEnd = updatedTime[0];
  }

  res.status(200).json(result);
}

module.exports = {
  alarmStart,
  alarmUpdate
}