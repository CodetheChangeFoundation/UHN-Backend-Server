var database = require("../database/database");
var mongoose = database.getmongoose();
var Schema = mongoose.Schema;

const model = mongoose.model("help_requests", new Schema({
  user_id: String,
  responder_id: String,
  status: {
    type: String,
    enum: ["open", "sent_to_responder", "taken", "arrived", "resolved"]
  },
  responders: [{ _id: false, id: String }]
},
{ 
  timestamps: { 
    createdAt: "created_at", 
    updatedAt: "updated_at" 
  }, 
  versionKey: false 
}));

module.exports = {
  model
}
