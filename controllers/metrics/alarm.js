let alarmService = require("../../services/metrics/alarmMetricService");

async function alarmStart(req, res) {
  let data = req.body;

  let result = {
    userID: data.userID,
    startTime: data.startTime,
    endTime: data.endTime
  };

  try {
    let alarmID = await alarmService.createAlarmLog(data.userID, data.startTime, data.endTime);
    console.log(alarmID);
    result.alarmID = alarmID;

  } catch (err) {
    console.log(err)
    result.metricError = "Cannot create metrics alarm log for user";
  }
  res.status(200).json(result);
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

  } catch (err) {
    console.log(err.message)
    result.metricError = "Cannot update metrics alarm log properties";
  }
  
  res.status(200).json(result);
}

module.exports = {
  alarmStart,
  alarmUpdate
}