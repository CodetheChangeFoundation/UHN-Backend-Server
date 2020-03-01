var redis = require("./redis");
const availableUsers = "available_users";

async function setAvailable(userId) {
  try {
    const res = await redis.saddAsync(availableUsers, userId);
  } catch(err) {
    console.log("redis setAvailable error: ", err.message);
  }
}

async function setUnavailable(userId) {
  try {
    const res = await redis.sremAsync(availableUsers, userId);
  } catch(err) {
    console.log("redis setUnavailable error: ", err.message);
  }
}

async function checkAvailabilityStatus(userId) {
  try {
    const res = await redis.sismemberAsync(availableUsers, userId);
    return res ? true : false;
  } catch(err) {
    console.log("redis checkAvailabilityStatus error: ", err.message);
    return false;
  }
}

module.exports = {
  setAvailable,
  setUnavailable,
  checkAvailabilityStatus,
}
