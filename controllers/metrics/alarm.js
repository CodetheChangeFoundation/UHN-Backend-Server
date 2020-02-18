let alarmService = require("../../Services/metrics/alarmMetricService");
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
  let sentStatus = req.body.sentStatus;
  let newEndTime = req.body.newEndTime;
  let id = req.params.alarmID;

  let result = {
    alarmID: id
  };

  if (sentStatus !== undefined) {
    sentStatus = sentStatus.toString()
  }

  let updatedStatus = null;
  let updatedTime = null;

  try {
    if (sentStatus) {
      updatedStatus = await alarmService.getAndUpdateAlarmSent(id, sentStatus);
    }
    if (newEndTime) {
      updatedTime = await alarmService.getAndUpdateAlarmEndTime(id, newEndTime);
    }

    if (updatedStatus !== null) {
      result.alarmStatus = updatedStatus[0];
    }
    if (updatedTime !== null) {
      result.alarmEnd = updatedTime[0];
    }

    res.status(200).json(result);

  } catch (err) {
    handle.internalServerError(res, err.message)
  }
}

module.exports = {
  alarmStart,
  alarmUpdate
}