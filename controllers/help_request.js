var handle = require("../utils/error_handling");
var ObjectId = require("mongodb").ObjectId;
var HelpRequestModel = require("../models/help_request").model;
var UserModel = require("../models/user").model;
var NotificationService = require("../services/notification.service");
var UserService = require("../services/user.service");

const addHelpRequest = async (req, res) => {
  let userId = req.body.userId;
  let user = null;

  try {
    user = await UserService.findUserById(userId);
  } catch (err) {
    handle.badRequest(res, err.message);
  }

  const responders = user.responders;

  let help_request = new HelpRequestModel({
    userId: userId,
    responderId: null,
    status: "open",
    responders: responders
  });

  try {
    await help_request.save();
  } catch (err) {
    handle.internalServerError(res, "Cannot create help request.");
  }

  await NotificationService.sendBatchNotifications(user, help_request);

  res.status(200).json({
    id: help_request._id.toString(),
    userId: help_request.userId,
    responderId: help_request.responderId,
    status: help_request.status,
    repsonders: help_request.responders,
    createdAt: help_request.createdAt,
    updatedAt: help_request.updatedAt
  });
};

module.exports = {
  addHelpRequest
};
