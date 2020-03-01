import ResponseMetricModel from "../../models/metrics/response";
import metrics from "../../database/postgres";

let metricDB = metrics.getMetrics();

async function createResponseLog(alarmID, userID, response, time) {
  let newResponse = null;
  let responseModel = new ResponseMetricModel(null, userID, alarmID, response, time);

  try {
    await metricDB("responselog").insert({
      responderid: responseModel.responderID,
      alarmid: responseModel.alarmID,
      alertresponse: responseModel.alertResponse,
      responsetime: responseModel.responseTime
    }).returning("*").then(res => {
      console.log(res)
      newResponse = res;
    });
  } catch (err) {
    throw err;
  }
  
  return newResponse;
}

module.exports = {
  createResponseLog
}