import ResponseMetricModel from "../../Models/metrics/response";
import metrics from "../../database/postgres";

let metricDB = metrics.getMetrics();

async function createResponseLog(alarmID, userID, response, time) {
  let newResponseiD = null;
  let responseModel = new ResponseMetricModel(null, userID, alarmID, response, time);

  try {
    await metricDB("responselog").insert({
      responderid: responseModel.responderID,
      alarmid: responseModel.alarmID,
      alertresponse: responseModel.alertResponse,
      responsetime: responseModel.responseTime
    }).returning("*").then(res => {
      console.log(res)
      newResponseID = res[0].id;
    });

    return newResponseID;

  } catch (err) {
    throw err;
  }
  
}

module.exports = {
  createResponseLog
}