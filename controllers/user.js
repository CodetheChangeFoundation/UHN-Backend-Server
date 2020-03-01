let jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var ObjectId = require("mongodb").ObjectId;
var handle = require("../utils/error_handling");
const { customValidationResult } = require("../utils/error_handling");

let metricService = require("../services/metrics/userMetricService");

var UserModel = require("../models/user").model;
var OnlineService = require("../services/online.service");
var UserService = require("../services/user.service");

async function loginUser(req, res) {
  const errors = customValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    var username = req.body.username;
    var password = req.body.password;

    var result = null;

    try {
      result = await UserService.findUserByUsername(username, password);
    } catch (err) {
      handle.notFound(res, err.message);
    }

    try {
      if (bcrypt.compareSync(password, result.password)) {
        let token = jwt.sign({ id: result._id }, process.env.SECRET, {
          expiresIn: "24h"
        });

        OnlineService.setOnline(result._id.toString());

        try {
          await metricService.updateUserLoginTime(username);
        } catch (err) {
          handle.notFound(res, 'Cannot find user in metrics database');
        }

        res.status(200).json({
          success: true,
          message: "Authentication successful!",
          token: token,
          id: result._id
        });
      } else {
        handle.unauthorized(res, "Username or password incorrect");
      }
    } catch (err) {
      handle.internalServerError(res, "Bcrypt compareSync failed");
    }
  }
}

async function signupUser(req, res) {
  const errors = customValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    var username = req.body.username;
    var email = req.body.email;
    var pass = req.body.password;
    var phone = req.body.phone;
    try {
      let foundUser = await UserModel.findOne({ username: username }).exec();
      if (foundUser) {
        return handle.badRequest(res, "username already exists");
      }
    } catch {
      handle.internalServerError(res, "cannot query database");
    }

    let newUser = new UserModel({
      username: username,
      email: email,
      password: bcrypt.hashSync(pass, 10),
      phone: phone
    });

    try {
      await newUser.save();
    } catch (err) {
      return handle.internalServerError(res, "Cannot create user.");
    }

    OnlineService.setOffline(newUser._id.toString());

    let result = UserService.cleanUserAttributes(newUser.toJSON());

    try {
      await metricService.addNewUserToMetrics(result.id, username);
    } catch (err) {
      console.log(err)
      handle.internalServerError(res, "Cannot add new user to metrics database")
    }

    res.status(200).json(result);
  }
}

async function userInfo(req, res) {
  var user = null;

  try {
    user = await UserService.findUserById(req.params.id);
  } catch (err) {
    handle.notFound(res, err.message);
  }

  var onlineStatus = await OnlineService.checkOnlineStatus(user._id);

  let result = UserService.cleanUserAttributes(user);
  result.onlineStatus = onlineStatus;
  res.status(200).json(result);
}

async function getResponders(req, res) {
  const user = await UserModel.findOne({
    _id: new ObjectId(req.params.id)
  }).lean();

  var returnInfo = [];
  if (user) {
    let responders = user.responders;
    for (let r of responders) {
      var responder = await UserModel.findOne({
        _id: new ObjectId(r.id)
      }).lean();
      let onlineStatus = await OnlineService.checkOnlineStatus(r.id);
      returnInfo.push({
        id: r.id,
        username: responder.username,
        onlineStatus: onlineStatus
      });
    }
    res.status(200).json({ responders: returnInfo });
  } else {
    handle.notFound(res, "Cannot find requested user ID in database");
  }
}

async function getResponderCount(req, res) {
  const user = await UserModel.findOne({
    _id: new ObjectId(req.params.id)
  }).lean();

  if (user) {
    let responders = user.responders;
    if (req.query.online == "false" || Object.entries(req.query).length == 0) {
      res.status(200).json({ count: responders.length });
    } else {
      let count = 0;
      for (let r of responders) {
        var responder = await UserModel.findOne({
          _id: new ObjectId(r.id)
        }).lean();
        let onlineStatus = await OnlineService.checkOnlineStatus(r.id);
        if (onlineStatus == true) count++;
      }
      res.status(200).json({ count: count });
    }
  } else {
    handle.notFound(res, "Cannot find requested user ID in database");
  }
}

async function addResponders(req, res) {
  var respondersToAdd = req.body.respondersToAdd;

  if (respondersToAdd == null) {
    handle.badRequest(res, "The attribute 'respondersToAdd' is required.");
  } else {
    const user = await UserModel.findOne({ _id: new ObjectId(req.params.id) });

    var validFlag = true;

    if (user) {
      for (var i = 0, len = respondersToAdd.length; i < len; i++) {
        //validating responders to be added
        try {
          var foundUser = await UserModel.findOne({
            _id: new ObjectId(respondersToAdd[i].id)
          });
        } catch {
          validFlag = false; //not single String of 12 bytes or a string of 24 hex characters
          break;
        }

        if (
          foundUser == null ||
          user.responders.find(e => e.id === foundUser.id)
        ) {
          validFlag = false; //does not exist in database
          break;
        }
      }

      if (validFlag == true) {
        let returnInfo = [];

        for (var i = 0, len = respondersToAdd.length; i < len; i++) {
          user.responders.push(respondersToAdd[i]);
          let responder = await UserModel.findOne({
            _id: new ObjectId(respondersToAdd[i].id)
          }).lean();

          let onlineStatus = await OnlineService.checkOnlineStatus(
            respondersToAdd[i].id
          );
          returnInfo.push({
            id: respondersToAdd[i].id,
            username: responder.username,
            onlineStatus: onlineStatus
          });
        }

        user.save();

        res.status(200).json({ respondersAdded: returnInfo });
      } else {
        handle.badRequest(res, "One of responders to add is not valid"); //not single String of 12 bytes or a string of 24 hex characters or
      }
    } else {
      handle.notFound(res, "Cannot find requested user ID in database");
    }
  }
}

async function deleteResponders(req, res) {
  var user = null;

  try {
    user = await UserService.findUserById(req.params.id);
  } catch (err) {
    handle.notFound(res, err.message);
  }

  var respondersToDelete = req.body.respondersToDelete;
  let returnInfo = [];

  var responders = user.get("responders");
  let respondersToDeleteAreValid = true;
  for (let i of respondersToDelete) {
    respondersToDeleteAreValid = responders.some(
      responder => responder["id"] === i.id
    );
    if (!respondersToDeleteAreValid)
      break;
  }

  if (respondersToDeleteAreValid) {
    for (let i of respondersToDelete) {
      user.responders.pull({ id: i.id });
      let responder = await UserModel.findOne({
        _id: new ObjectId(i.id)
      }).lean();

      returnInfo.push({
        id: i.id,
        username: responder.username
      });
    }
    user.save();
    res.status(200).json({ respondersDeleted: returnInfo });

  } else {
    handle.badRequest(res, "At least one of the responders is not valid to delete for this user");
  }
}

async function searchUsers(req, res) {
  try {
    var result = await UserModel.find(null, "username _id").lean();
  } catch {
    handle.internalServerError(res, "Failed to query user database");
  }

  if (req.query.online == "true" || req.query.online == "false") {
    let promiseArr = [];
    for (let user of result) {
      promiseArr.push(OnlineService.checkOnlineStatus(user._id.toString()));
    }
    var userStatus = await Promise.all(promiseArr);
    var onlineUsers = result.filter((user, index) => {
      if (req.query.online == "true") {
        return userStatus[index];
      } else if (req.query.online == "false") {
        return !userStatus[index];
      }
    });

    res.status(200).send(onlineUsers);
  } else {
    res.status(200).send(result);
  }
}

async function toggleStatus(req, res) {
  if (req.body.request == "online") {
    OnlineService.setOnline(req.params.id);
    res.status(200).send("User now online");
  } else if (req.body.request == "offline") {
    OnlineService.setOffline(req.params.id);
    res.status(200).send("User now offline");
  } else {
    handle.badRequest(res, "Invalid status toggle request");
  }
}

async function updateLocation(req, res) {
  var query = { _id: new ObjectId(req.params.id) };
  try {
    var result = await UserModel.findOneAndUpdate(
      query,
      {
        location: {
          coords: req.body.coords,
          note: req.body.note && req.body.note
        }
      },
      { new: true }
    ).lean();
  } catch {
    handle.internalServerError("Location could not be updated");
  }
  res.status(200).json({
    id: result._id,
    location: result.location,
    note: result.note
  });
}

async function getLocation(req, res) {
  const result = await UserModel.findOne({
    _id: new ObjectId(req.params.id)
  }).lean();

  if (result) {
    const data = {
      location: result.location
    };
    res.status(200).json(data);
  } else {
    handle.notFound(res, "Cannot find requested user!");
  }
}

async function addPushToken(req, res) {
  try {
    var result = await UserModel.findOneAndUpdate(
      {
        _id: new ObjectId(req.params.id)
      },
      {
        pushToken: req.body.pushToken
      },
      { new: true }
    ).lean();
  } catch (err) {
    handle.internalServerError(res, "Cannot update user's push token");
  }

  res.status(200).json({
    id: result._id,
    pushToken: result.pushToken
  });
}

module.exports = {
  signupUser,
  loginUser,
  userInfo,
  getResponders,
  addResponders,
  deleteResponders,
  searchUsers,
  toggleStatus,
  updateLocation,
  getLocation,
  getResponderCount,
  addPushToken
};
