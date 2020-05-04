var ObjectId = require("mongodb").ObjectId;
var UserModel = require("../models/user").model;

const findUserById = async (userId, withPassword = false) => {
  let user = null;

  if (!withPassword) {
    user = await UserModel.findOne({
      _id: new ObjectId(userId),
    }).select("-password");
  } else {
    user = await UserModel.findOne({
      _id: new ObjectId(userId),
    });
  }

  if (!user) {
    throw new Error(`User with id ${userId} not found.`);
  } else {
    return user;
  }
};

const findUserByUsername = async (username, withPassword = false) => {
  let user = null;

  if (!withPassword) {
    user = await UserModel.findOne({ username: username }).select("-password");
  } else {
    user = await UserModel.findOne({
      username: username,
    });
  }

  if (!user) {
    throw new Error(`User with username ${username} cannot be found.`);
  } else {
    return user;
  }
};

const updateUserById = async (
  userId,
  attributesToUpdate,
  withPassword = false
) => {
  let user = null;

  if (!withPassword) {
    user = await UserModel.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      attributesToUpdate,
      { new: true }
    ).select("-password");
  } else {
    user = await UserModel.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      attributesToUpdate,
      { new: true }
    );
  }

  if (!user) {
    throw new Error(`User with user id ${userId} cannot be updated`)
  } else {
    return user;
  }
};

const cleanUserAttributes = (user) => {
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
  updateUserById,
  cleanUserAttributes,
};
