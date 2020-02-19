let arrivalService = require("../../Services/metrics/arrivalMetricService");
const handle = require("../../Utils/error_handling");

async function responderArrival(req, res) {
  let responseID = req.body.responseID;
  let arrivalTime = req.body.arrivalTime;

  try {
    let arrivalID = await arrivalService.createArrivalLog(responseID, arrivalTime);
    res.status(200).json({
      id: arrivalID,
      responseID: responseID,
      arrivalTime: arrivalTime
    });

  } catch (err) {
    console.log(err)
    handle.internalServerError(res, "Cannot create metrics arrival log");
  }
}

module.exports = {
  responderArrival
}