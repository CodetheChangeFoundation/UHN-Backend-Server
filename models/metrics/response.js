export default class ResponseMetricModel {
  constructor(id, responderID, alarmID, alertResponse, responseTime) {
    this.id = id;
    this.responderID = responderID;
    this.alarmID = alarmID;
    this.alertResponse = alertResponse;
    this.responseTime = responseTime;
  }
}