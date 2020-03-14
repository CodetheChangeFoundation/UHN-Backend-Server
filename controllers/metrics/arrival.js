let arrivalService = require("../../Services/metrics/arrivalMetricService");

async function responderArrival(req, res) {
  let responseID = req.body.responseID;
  let arrivalTime = req.body.arrivalTime;

  let result = {
    responseID: responseID,
    arrivalTime: arrivalTime
  };

  try {
    let arrivalID = await arrivalService.createArrivalLog(responseID, arrivalTime);
    result.id = arrivalID;

  } catch (err) {
    console.log(err)
    result.metricError = "Cannot create metrics arrival log";
  }
  
  res.status(200).json(result);
}

module.exports = {
  responderArrival
}