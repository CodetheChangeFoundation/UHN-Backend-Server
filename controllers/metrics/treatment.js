let treatmentService = require("../../Services/metrics/treatmentMetricService");
let handle = require("../../utils/error_handling");

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

    res.status(200).json(result);

  } catch (err) {
    console.log(err);
    handle.internalServerError(res, "Cannot create treatment metrics log");
  }
  
}

module.exports = {
  recordTreatment
}