let jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var ObjectId = require("mongodb").ObjectId;
var handle = require("../Utils/error_handling");
const { customValidationResult } = require("../Utils/error_handling");

let metricService = require("../Services/userMetricService");

var UserModel = require("../Models/user").model;
var OnlineService = require("../Utils/online_status");

async function loginUser(req, res) {
  const errors = customValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    var username = req.body.username;
    var password = req.body.password;

    var data = {
      username: username,
      password: password
    };

    try {
      console.log({ username: data.username, password: data.password });
      var result = await UserModel.findOne(
        { username: username },
        "password"
      ).lean();
      console.log(result);
    } catch (err) {
      handle.notFound(res, "Cannot find requested username in database");
    }

    if (result != null) {
      try {
        if (bcrypt.compareSync(data.password, result.password)) {
          let token = jwt.sign(
            { id: result._id },
            process.env.SECRET,
            {
              expiresIn: "24h"
            }
          );

          OnlineService.setOnline(result._id.toString());

          res.status(200).json({
            success: true,
            message: "Authentication successful!",
            token: token,
            id: result._id
          });
          console.log("Successful login");

          try {
            await metricService.updateUserLoginTime(data.username);
          } catch (err) {
            handle.notFound(res, 'Cannot find user in metrics database');
          }

        } else {
          handle.unauthorized(res, "Password incorrect");
        }
      } catch (err) {
        console.log(process.env.SECRET);
        handle.internalServerError(res, "Bcrypt compareSync failed");
      }
    } else {
      handle.notFound(res, "Cannot find requested user ID in database");
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

    var result = null;

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
    await newUser.save();

    try {
      result = await UserModel.findOne({ username: username }).exec();
    } catch {
      handle.internalServerError(res, "new user not added to the database");
    }

    try {
      await metricService.addNewUserToMetrics(username);
    } catch (err) {
      console.log(err)
      handle.internalServerError(res, "Cannot add new user to metrics database")
    }

    OnlineService.setOffline(result._id.toString());
    if (result)
      res.status(200).json({ username: username, email: email, phone: phone });
  }
}

async function userInfo(req, res) {
  const result = await UserModel.findOne({
    _id: new ObjectId(req.params.id)
  }).lean();

  var onlineStatus = await OnlineService.checkOnlineStatus(req.params.id);

  if (result) {
    var data = {
      username: result.username,
      email: result.email,
      phone: result.phone,
      online: onlineStatus
    };
    res.status(200).json(data);
  } else {
    handle.notFound(res, "Cannot find requested user ID in database");
  }
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
    handle.badRequest(res, "No responders requested to be added");
  } else {
    const user = await UserModel.findOne({ _id: new ObjectId(req.params.id) });

    var validFlag = true;

    if (user) {
      for (var i = 0, len = respondersToAdd.length; i < len; i++) {
        //validating responders to be added
        try {
          var foundUser = await UserModel.findOne({
            _id: new ObjectId(respondersToAdd[i].id)
          }); //
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
          user.save();

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

        res.status(200).json({ respondersAdded: returnInfo });
      } else {
        handle.badRequest(res, "One of responders to add is not valid"); //not single String of 12 bytes or a string of 24 hex characters or
      }
    } else {
      handle.notFound(res, "Cannot find requested user ID in database");
    }
  }
}

async function deleteResponder(req, res) {
  var user = await UserModel.findOne({ _id: new ObjectId(req.params.id) });
  if (user) {
    var responders = user.get("responders");
    let hasResponderID = responders.some(
      responder => responder["id"] === req.params.responderid
    );
    if (hasResponderID) {
      user.responders.pull({ id: req.params.responderid });
      user.save();
      res.status(200).json({ id: req.params.responderid });
    } else {
      handle.badRequest(res, "Responder is not valid to delete for this user");
    }
  } else {
    handle.notFound(res, "Cannot find requested user ID in database");
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

module.exports = {
  signupUser,
  loginUser,
  userInfo,
  getResponders,
  addResponders,
  deleteResponder,
  searchUsers,
  toggleStatus,
  updateLocation,
  getLocation,
  getResponderCount
};
