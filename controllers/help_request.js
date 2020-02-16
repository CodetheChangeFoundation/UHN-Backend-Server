var handle = require("../utils/error_handling");
var ObjectId = require("mongodb").ObjectId;
var HelpRequestModel = require("../models/help_request").model;
var UserModel = require("../models/user").model;
var NotificationService = require("../services/notification.service");
var UserService = require("../services/user.service");

const putHelpRequest = async (req, res) => {
  let status = req.body.status;
  let newResponder = req.body.newResponder;
  let helpReqId = req.body.helpReqId;

  if (!(status=="open"||status=="sent_to_responder"||status=="taken"||status=="arrived"||status=="resolved")){
    handle.badRequest(res, "Incorrect status")
  }
  else{
    try {
      var help_request = await HelpRequestModel.findOne({
        _id: new ObjectId(helpReqId)
      })
    } catch (err) {
      handle.badRequest(res, err.message);
    }

    if (help_request==null)
      handle.badRequest(res,"Help Request does not exist")
    else{
      help_request.responderIds.push({_id:false, id: newResponder});
      if(status!=null)
        help_request.status = status;
      help_request.save();


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

module.exports = {
  addHelpRequest,
  putHelpRequest
};
