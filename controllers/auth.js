let jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
const randToken = require("rand-token");

const { customValidationResult } = require("../utils/validations");
var handle = require("../utils/error_handling");

var UserModel = require("../models/user").model;

let metricService = require("../services/metrics/userMetricService");
var RefreshTokenService = require("../services/refresh-token.service");
var AvailbilityService = require("../services/availability.service");
var OnlineService = require("../services/online.service");
var UserService = require("../services/user.service");
var ResetPasswordService = require("../services/reset-password.service");
var TextMessagingService = require("../services/text-messaging.service");

const TOKEN_DURATION = "15m";

async function login(req, res) {
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

    let temporaryPassword = await ResetPasswordService.getTemporaryPassword(
      username
    );

    try {
      if (
        !bcrypt.compareSync(password, result.password) &&
        !bcrypt.compareSync(
          password,
          temporaryPassword
        )
      ) {
        return handle.unauthorized(res, "Username or password incorrect");
      } else {
        let token = jwt.sign({ id: result._id }, process.env.SECRET, {
          expiresIn: TOKEN_DURATION,
        });

        let refreshToken = randToken.uid(128);
        RefreshTokenService.deleteRefreshToken(result._id);
        RefreshTokenService.addRefreshToken(result._id, refreshToken);

        try {
          await OnlineService.setOnline(result._id.toString());
          var onlineStatus = await OnlineService.checkOnlineStatus(
            result._id.toString()
          );
          if (onlineStatus && result.naloxoneAvailability) {
            AvailbilityService.setAvailable(result._id.toString());
          } else {
            AvailbilityService.setUnavailable(result._id.toString());
          }
        } catch (err) {
          console.log("redis error: ", err.message);
        }

        try {
          await metricService.updateUserLoginTime(username);
        } catch (err) {
          handle.notFound(res, "Cannot find user in metrics database");
        }

        await ResetPasswordService.removeTemporaryPassword(username);

        res.status(200).json({
          success: true,
          message: "Authentication successful!",
          token: token,
          refreshToken: refreshToken,
          id: result._id,
          naloxoneAvailability: result.naloxoneAvailability,
        });
      }
    } catch (err) {
      handle.internalServerError(res, "Bcrypt compareSync failed");
    }
  }
}

async function signup(req, res) {
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
      phone: phone,
      naloxoneAvailability: false,
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
      console.log(err);
      handle.internalServerError(
        res,
        "Cannot add new user to metrics database"
      );
    }

    res.status(200).json(result);
  }
}

async function useRefreshToken(req, res) {
  const errors = customValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    let userId = req.body.userId;
    let refreshToken = req.body.refreshToken;
    if (await RefreshTokenService.checkRefreshToken(userId, refreshToken)) {
      let token = jwt.sign({ id: userId }, process.env.SECRET, {
        expiresIn: TOKEN_DURATION,
      });

      // Consider generating new refresh token and returning it so that refresh token will also expire
      res.status(200).json({ token: token });
    } else {
      handle.unauthorized(res, "Refresh token and user id do not match");
    }
  }
}

async function resetPassword(req, res) {
  const errors = customValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    let username = req.body.username;
    let phone = req.body.phone;

    let user = null;
    try {
      user = await UserService.findUserByUsername(username);
    } catch (err) {
      return handle.notFound(res, err.message);
    }

    if (phone != user.phone)
      return handle.notFound(res, "Username and phone number do not match");

    const temporaryPassword = await ResetPasswordService.applyTemporaryPassword(
      user.username
    );

    // Send text message with temporary password to the specified phone number
    TextMessagingService.sendTemporaryPassword(user.phone, temporaryPassword);

    res.status(200).json({
      temporaryPassword: temporaryPassword,
    });
  }
}
module.exports = {
  login,
  signup,
  useRefreshToken,
  resetPassword,
};
