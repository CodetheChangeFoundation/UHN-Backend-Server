export default class UserMetricModel {
  constructor(id, mongoID, name, lastLogin) {
    this.id = id;
    this.mongoID = mongoID
    this.name = name;
    this.lastLogin = lastLogin;
  }
}