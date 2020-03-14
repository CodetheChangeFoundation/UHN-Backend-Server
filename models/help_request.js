var mongoose = require("../database/mongoose");
var mongoose = mongoose.getmongoose();
var Schema = mongoose.Schema;
const { HELP_REQUEST_STATUS, HELP_REQUEST_LIMIT } = require('../constants/help_request')

const arrayLimit = (val) => {
  return val.length <= HELP_REQUEST_LIMIT;
}


const model = mongoose.model("help_requests", new Schema({
  userId: String,
  responderIds: {
    type:[{_id: false, id: String}],
    validate: [arrayLimit, `{PATH} exceeds the limit of ${HELP_REQUEST_LIMIT}`]
  },
  status: {
    type: String,
    enum: HELP_REQUEST_STATUS
  },
  userResponders: [{ _id: false, id: String }]
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
