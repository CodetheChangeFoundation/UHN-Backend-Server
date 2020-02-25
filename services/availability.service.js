var redis = require("./redis");
const availabilityValue = "available";

async function setAvailable(userid) {
  try {
    const res = await redis.setAsync(availabilityValue + userid, availabilityValue);
  } catch(err) {
    console.log("redis setAvailable error: ", err.message);
  }
}

async function setUnavailable(userid) {
  try {
    const res = await redis.delAsync(availabilityValue + userid);
  } catch(err) {
    console.log("redis setUnavailable error: ", err.message);
  }
}

async function checkAvailabilityStatus(userid) {
  try {
    const res = await redis.getAsync(availabilityValue + userid);
    return res === availabilityValue;
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
