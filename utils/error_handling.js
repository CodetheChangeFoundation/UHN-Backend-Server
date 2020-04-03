const msg = require("./error_messages");
const { body, validationResult } = require("express-validator");

class ErrorFormat {
  constructor(message) {
    this.message = message;
  }
}

function badRequest(res, details, statusType) {
  res.status(400).json({ 
    errors: [new ErrorFormat(details)],
    statusCode: statusType
   });
}

function unauthorized(res, details, statusType) {
  res.status(401).json({ 
    errors: [new ErrorFormat(details)],
    statusCode: statusType
  });
}

function internalServerError(res, details, statusType) {
  res.status(500).json({ 
    errors: [new ErrorFormat(details)],
    statusCode: statusType
  });
}

function notFound(res, details, statusType) {
  res.status(404).json({ 
    errors: [new ErrorFormat(details)],
    statusCode: statusType
  });
}

const customValidationResult = validationResult.withDefaults({
  formatter: error => {
    return {
      message: error.msg,
      param: error.param,
      location: error.location
    };
  }
});

function validateSignup() {
  return [
    body("username")
      .exists()
      .bail()
      .withMessage(msg.USERNAME_MANDATORY)
      .isLength({ min: 5 })
      .bail()
      .withMessage(msg.USERNAME_CONDITION),
    body("password")
      .exists()
      .bail()
      .withMessage(msg.PASSWORD_MANDATORY)
      // TODO: Review password policy
      .isLength({ min: 5 })
      .bail()
      .withMessage(msg.PASSWORD_CONDITION),
    body("phone")
      .exists()
      .bail()
      .withMessage(msg.PHONE_MANDATORY)
  ];
}

function validateLogin() {
  return [
    body("username")
      .exists()
      .bail()
      .withMessage(msg.USERNAME_MANDATORY),
    body("password")
      .exists()
      .bail()
      .withMessage(msg.PASSWORD_MANDATORY)
  ];
}

function validateUseRefreshToken() {
  return [
    body("userId")
      .exists()
      .bail()
      .withMessage(msg.USER_ID_MANDATORY),
    body("refreshToken")
      .exists()
      .bail()
      .withMessage(msg.REFRESH_TOKEN_MANDATORY)
  ];
}

function validateDeleteRefreshToken() {
  return [
    body("refreshToken")
      .exists()
      .bail()
      .withMessage(msg.REFRESH_TOKEN_MANDATORY)
  ]
}

module.exports = {
  badRequest,
  unauthorized,
  internalServerError,
  notFound,
  customValidationResult,
  validateSignup,
  validateLogin,
  validateUseRefreshToken,
  validateDeleteRefreshToken,
};
