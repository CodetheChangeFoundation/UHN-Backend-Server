import TreatmentMetricModel from "../../Models/metrics/treatment";
import metrics from "../../database/postgres";

let metricDB = metrics.getMetrics();

async function createTreatmentLog(alarmID, successful) {
  let treatment = new TreatmentMetricModel(null, alarmID, successful);

  try {
    let newLog = null;
    newLog = await metricDB("treatmentlog").insert({
      alarmid: treatment.alarmID,
      alertsuccessful: treatment.successful
    }).returning("*");

    return newLog[0].id;

  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  createTreatmentLog
}