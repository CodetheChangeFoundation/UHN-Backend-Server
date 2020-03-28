import ArrivalMetricModel from "../../models/metrics/arrival";
import metrics from "../../database/postgres";

let metricDB = metrics.getMetrics();

async function createArrivalLog(responseID, arrivalTime) {
  let arrivalID = null;
  let arrival = new ArrivalMetricModel(null, responseID, arrivalTime);

  try {
    arrivalID = await metricDB("arrivallog").insert({
      responseid: arrival.responseID,
      arrivaltime: arrival.arrivalTime
    }).returning("id");

    return arrivalID[0];

  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  createArrivalLog
}