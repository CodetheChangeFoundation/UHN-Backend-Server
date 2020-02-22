var handle = require("../utils/error_handling");
var ObjectId = require("mongodb").ObjectId;
var HelpRequestModel = require("../models/help_request").model;
var UserModel = require("../models/user").model;
var NotificationService = require("../services/notification.service");
var UserService = require("../services/user.service");

const putHelpRequest = async (req, res) => {
  let status = req.body.status;
  let newResponderId = req.body.newResponderId;
  let helpReqId = req.params.id;

  if ((!(status === "open" || status === "sent_to_responder" || status === "taken" || status === "arrived" || status === "resolved")) || newResponderId == null || status == null) {
    handle.badRequest(res, "Incorrect request");
  }
  else {
    try {
      var help_request = await HelpRequestModel.findOne({
        _id: new ObjectId(helpReqId)
      })
    } catch (err) {
      handle.badRequest(res, err.message);
    }

    if (help_request == null)
      handle.badRequest(res, "Help Request does not exist")
    else {
      let responderIds = help_request.responderIds;
      if (responderIds.some(r => r.id === newResponderId))
        handle.badRequest(res, "Responder has already been added");
      else {
        let limitReached = false;
        try {
          help_request.responderIds.push({ _id: false, id: newResponderId });
          await help_request.save();
          help_request.status = status;
        }
        catch (err) {
          limitReached = true
          handle.badRequest(res, err.message);
        }

        if (!limitReached) {
          res.status(200).json({
            id: help_request._id.toString(),
            userId: help_request.userId,
            responderIds: help_request.responderIds,
            status: help_request.status,
            userResponders: help_request.userResponders,
            createdAt: help_request.createdAt,
            updatedAt: help_request.updatedAt
          });
        }
      }
    }
  }
}

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
    responderIds: [],
    status: "open",
    userResponders: responders
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
    responderIds: help_request.responderIds,
    status: help_request.status,
    userResponders: help_request.userResponders,
    createdAt: help_request.createdAt,
    updatedAt: help_request.updatedAt
  });
};


const getHelpRequestResponderCount = async (req,res) => {
  let helpReqId = req.params.id;

  try {
    var help_request = await HelpRequestModel.findOne({
      _id: new ObjectId(helpReqId)
    })
  } catch (err) {
    handle.badRequest(res, err.message);
  }

  res.status(200).json({
    count: help_request.responderIds.length
  });


module.exports = {
  addHelpRequest,
  putHelpRequest
  getHelpRequestResponderCount
};
