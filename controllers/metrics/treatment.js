let treatmentService = require("../../Services/metrics/treatmentMetricService");
const handle = require("../../Utils/error_handling");

async function recordTreatment(req, res) {
  let alarmID = req.body.alarmID;
  let alarmSuccess = req.body.alarmSuccess.toString();
  
  try {
    let treatmentID = await treatmentService.createTreatmentLog(alarmID, alarmSuccess);
    res.status(200).json({
      id: treatmentID,
      alarmID: alarmID,
      alarmSuccess: alarmSuccess
    });

  } catch (err) {
    console.log(err);
    handle.internalServerError(res, "Cannot create treatment metrics log");
  }
}

module.exports = {
  recordTreatment
}