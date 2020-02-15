var database = require("../database/database");
var mongoose = database.getmongoose();
var Schema = mongoose.Schema;

const arrayLimit = (val) => {
  return val.length <= 6;
}


const model = mongoose.model("help_requests", new Schema({
  userId: String,
  responderIds: {
    [{ _id: false, id: String
    }], // max of 6
    validate: [arrayLimit, '{PATH} exceeds the limit of 6']
  }
  status: {
    type: String,
    enum: ["open", "sent_to_responder", "taken", "arrived", "resolved"]
  },
  responders: [{ _id: false, id: String }]
},
{
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  },
  versionKey: false
}));



module.exports = {
  model
}
