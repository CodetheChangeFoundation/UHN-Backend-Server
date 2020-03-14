let treatmentService = require("../../Services/metrics/treatmentMetricService");

async function recordTreatment(req, res) {
  let responseID = req.body.responseID;
  let alarmSuccess = req.body.alarmSuccess;
  let treatmentTime = req.body.treatmentTime;
  
  if (alarmSuccess !== undefined) {
    alarmSuccess = alarmSuccess.toString();
  }

  let result = {
    responseID: responseID,
    alarmSuccess: req.body.alarmSuccess,
    treatmentTime: treatmentTime
  }

  try {
    let treatmentID = await treatmentService.createTreatmentLog(responseID, alarmSuccess, treatmentTime);
    result.id = treatmentID;

  } catch (err) {
    console.log(err);
    result.metricError = "Cannot create treatment metrics log";
  }
  
  res.status(200).json(result);
}

module.exports = {
  recordTreatment
}