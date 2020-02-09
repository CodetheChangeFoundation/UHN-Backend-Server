var ObjectId = require("mongodb").ObjectId;
var UserModel = require("../models/user").model;

const findUserById = async (user_id, withPassword = false) => {
  let user = null;

  if (!withPassword) {
    user = await UserModel.findOne({
      _id: new ObjectId(user_id)
    })
      .select("-password");
  } else {
    user = await UserModel.findOne({
      _id: new ObjectId(user_id)
    });
  }

  if (!user) {
    throw new Error(`User with id ${user_id} not found.`);
  } else {
    return user;
  }
};

const findUserByUsername = async (username, withPassword = false) => {
  let user = null;

  if (!withPassword) {
    user = await UserModel.findOne({ username: username })
      .select("-password");
  } else {
    user = await UserModel.findOne({
      username: username
    });
  }

  if (!user) {
    throw new Error(`User with username ${username} cannot be found.`);
  } else {
    return user;
  }
};

const cleanUserAttributes = user => {
  if (user.password) {
    delete user.password;
  }

  user.id = user._id;
  delete user._id;

  return user;
};

module.exports = {
  findUserById,
  findUserByUsername,
  cleanUserAttributes
};
