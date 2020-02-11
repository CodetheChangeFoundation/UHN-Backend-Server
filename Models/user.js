var database = require("../database/mongoose");
var mongoose = database.getmongoose();
var Schema = mongoose.Schema;

const model = mongoose.model("users", new Schema({
  username: String,
  password: String,
  email: String,
  phone: String,
  location:{
    coords: {
      lat: Number,
      lng: Number
    },
    note: String,
  },
  responders: [{_id:false, id: String}]
}));

module.exports = {
  model
}
