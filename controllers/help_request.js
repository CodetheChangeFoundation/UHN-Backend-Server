var handle = require("../utils/error_handling");
var ObjectId = require("mongodb").ObjectId;
var HelpRequestModel = require("../models/help_request").model;
var NotificationService = require("../services/notification.service");
var UserService = require("../services/user.service");
import * as StatusCodes from "../utils/error_status_codes"
const { HELP_REQUEST_STATUS, HELP_REQUEST_LIMIT } = require('../constants/help_request')

const putHelpRequest = async (req, res) => {
  const status = req.body.status;
  const newResponderId = req.body.newResponderId;
  const helpReqId = req.params.id;

  if (!HELP_REQUEST_STATUS.some((hr_status) => hr_status === status ) && !newResponderId) {
    handle.badRequest(res, "Incorrect help request - one or multiple required fields are missing", StatusCodes.fieldError);
  }
  else {
    try {
      var help_request = await HelpRequestModel.findOne({
        _id: new ObjectId(helpReqId)
      })

      // If the helpRequedId does not exist
      if(help_request === null) throw "NOT_FOUND"

      if(newResponderId) {
        let responderIds = help_request.responderIds;

        // If newResponderID already exists
        if(responderIds.some(r => r.id === newResponderId)) throw "DUPLICATE"

        // If responderID limit reached and there is no status update
        if(help_request.responderIds.length >= HELP_REQUEST_LIMIT && !status) throw "LIMIT"
        else help_request.responderIds.push({ _id: false, id: newResponderId })
      }

      if(status) help_request.status = status;

      await help_request.save();

      res.status(200).json({
        id: help_request._id.toString(),
        userId: help_request.userId,
        responderIds: help_request.responderIds,
        status: help_request.status,
        // unsure if we need 'userResponders' still
        userResponders: help_request.userResponders,
        createdAt: help_request.createdAt,
        updatedAt: help_request.updatedAt
      });

    } catch (err) {
      if(err === "NOT_FOUND") handle.notFound(res, "Help Request does not exist")
      else if(err === "DUPLICATE") handle.badRequest(res, "Responder has already been added", StatusCodes.duplicateError);
      else if(err === "LIMIT") handle.badRequest(res, err.message, StatusCodes.limitReachedError);
      else handle.internalServerError(res, err.message);
    }
  }
}

const addHelpRequest = async (req, res) => {
  let userId = req.body.userId;
  let user = null;

  try {
    user = await UserService.findUserById(userId);
  } catch (err) {
    handle.internalServerError(res, err.message);
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

}

const getHelpRequest = async (req,res) => {
  let helpReqId = req.params.id;

  try {
    var help_request = await HelpRequestModel.findOne({
      _id: new ObjectId(helpReqId)
    })
  } catch (err) {
    handle.badRequest(res, err.message);
  }

  res.status(200).json({
    helpRequest: help_request
  });

}

module.exports = {
  addHelpRequest,
  putHelpRequest,
  getHelpRequest,
  getHelpRequestResponderCount
};
