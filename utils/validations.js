const msg = require("./error_messages");
const { body, validationResult } = require("express-validator");

const customValidationResult = validationResult.withDefaults({
  formatter: error => {
    return {
      message: error.msg,
      param: error.param,
      location: error.location
    };
  }
});

const validateSignup = () => {
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

const validateLogin = () => {
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

const validateUseRefreshToken = () => {
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

const validateResetPassword = () => {
  return [
    body("username")
      .exists()
      .bail()
      .withMessage(msg.USERNAME_MANDATORY),
    body("phone")
      .exists()
      .bail()
      .withMessage(msg.PHONE_MANDATORY)
  ];
}

const validateUpdateUserPassword = () => {
  return [
    body("password")
      .exists()
      .bail()
      .withMessage(msg.PASSWORD_MANDATORY)
  ]
}

module.exports = {
  customValidationResult,
  validateSignup,
  validateLogin,
  validateUseRefreshToken,
  validateResetPassword
}