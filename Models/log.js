var database = require("../database");
var mongoose = database.getmongoose();
var Schema = mongoose.Schema;
//var logSchema = mongoose.Schema;

const log_model = mongoose.model("users", new Schema({
   //DONT NEED   usertype: String, // for determining if user or responder
   username: String, // Can also be UserID
   details: String, // why it failed, the message
   created_at: {type: Date, default: Date.now},
   updated_at: {type: Date, default: Date.now},
   diff: { type: Schema.Types.Mixed }
}));

users.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

module.exports = {
  log_model
}
