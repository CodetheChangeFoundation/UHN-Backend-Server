import TreatmentMetricModel from "../../Models/metrics/treatment";
import metrics from "../../database/postgres";

let metricDB = metrics.getMetrics();

async function createTreatmentLog(responseID, successful, treatmentTime) {
  let treatment = new TreatmentMetricModel(null, responseID, successful, treatmentTime);

  try {
    let newLog = null;
    newLog = await metricDB("treatmentlog").insert({
      responseid: treatment.responseID,
      alertsuccessful: treatment.successful,
      treatmenttime: treatment.time
    }).returning("*");

    return newLog[0].id;

  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  createTreatmentLog
}