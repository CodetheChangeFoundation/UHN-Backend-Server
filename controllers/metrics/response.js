let responseService = require("../../Services/metrics/responseMetricService");
const handle = require("../../Utils/error_handling");

async function recordResponse(req, res) {
  let data = req.body;
  let response = req.body.response.toString();

  try {
    let responseID = await responseService.createResponseLog(data.alarmID, data.userID, response, data.responseTime);
    res.status(200).json({
      id: responseID,
      userID: data.userID,
      alarmID: data.alarmID,
      response: response,
      responseTime: data.responseTime
    });
  } catch (err) {
    console.log(err)
    handle.internalServerError(res, "Cannot create response log");
  }
}

module.exports = {
  recordResponse
}