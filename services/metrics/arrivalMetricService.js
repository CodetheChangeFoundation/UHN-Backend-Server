import ArrivalMetricModel from "../../Models/metrics/arrival";
import metrics from "../../database/postgres";

let metricDB = metrics.getMetrics();

async function createArrivalLog(responseID, arrivalTime) {
  let arrivalID = null;
  let arrival = new ArrivalMetricModel(null, responseID, arrivalTime);

  try {
    arrivalID = await metricDB("arrivallog").insert({
      responseid: arrival.responseID,
      arrivaltime: arrival.arrivalTime
    }).returning("*");

    return arrivalID[0].id;

  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  createArrivalLog
}