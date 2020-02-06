const alarmModel = require("../Models/alarm");
const handle = require("../Utils/error_handling");

async function alarmStart(req, res) {
  //let data = req.body;
  try {
    let alarmID = await alarmModel.createAlarmLog("John", new Date(), new Date());
    console.log(alarmID)
    res.status(200).json({
      success: true,
      message: "Successfully created alarm log for user",
      alarmID: alarmID
    });
  } catch (err) {
    handle.internalServerError(res, "Cannot create metrics alarm log");
  }
}

module.exports = {
  alarmStart
}