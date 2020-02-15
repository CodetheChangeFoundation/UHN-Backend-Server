var database = require("../database/database");
var mongoose = database.getmongoose();
var Schema = mongoose.Schema;

const model = mongoose.model("help_requests", new Schema({
  userId: String,
  responderId: String,
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
