let treatmentService = require("../../Services/metrics/treatmentMetricService");
const handle = require("../../Utils/error_handling");

async function recordTreatment(req, res) {
  let responseID = req.body.responseID;
  let alarmSuccess = req.body.alarmSuccess;
  let treatmentTime = req.body.treatmentTime;
  
  if (alarmSuccess !== undefined) {
    alarmSuccess = alarmSuccess.toString();
  }
  try {
    let treatmentID = await treatmentService.createTreatmentLog(responseID, alarmSuccess, treatmentTime);
    res.status(200).json({
      id: treatmentID,
      responseID: responseID,
      alarmSuccess: req.body.alarmSuccess,
      treatmentTime: treatmentTime
    });

  } catch (err) {
    console.log(err);
    handle.internalServerError(res, "Cannot create treatment metrics log");
  }
}

module.exports = {
  recordTreatment
}