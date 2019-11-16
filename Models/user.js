var database = require("../database");
var mongoose = database.getmongoose();
var Schema = mongoose.Schema;
var logSchema = mongoose.Schema;

const model = mongoose.model("users", new Schema({
  username: String,
  password: String,
  email: String,
  phone: String
}));
const log_model = mongoose.model("users", new Schema({
  log: LOG
}));
//I think LOG is a file format. It will incluethe time and 
module.exports = {
  model,
  log_model

}
