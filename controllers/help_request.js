var handle = require("../utils/error_handling");
var ObjectId = require("mongodb").ObjectId;
var HelpRequestModel = require("../models/help_request").model;
var UserModel = require("../models/user").model;
var NotificationService = require("../services/notification.service");
var UserService = require("../services/user.service");

const addHelpRequest = async (req, res) => {
  let user_id = req.body.user_id;
  let user = null;

  try {
    user = await UserService.findUserById(user_id);
  } catch (err) {
    handle.badRequest(res, err.message);
  }

  const responders = user.responders;

  let help_request = new HelpRequestModel({
    user_id: user_id,
    responder_id: null,
    status: "open",
    responders: responders
  });

  try {
    await help_request.save();
  } catch (err) {
    handle.internalServerError(res, "Cannot create help request.");
  }

  await NotificationService.sendBatchNotifications(responders, help_request);

  res.status(200).json({
    id: help_request._id.toString(),
    user_id: help_request.user_id,
    responder_id: help_request.responder_id,
    status: help_request.status,
    repsonders: help_request.responders,
    created_at: help_request.created_at,
    updated_at: help_request.updated_at
  });
};

module.exports = {
  addHelpRequest
};
