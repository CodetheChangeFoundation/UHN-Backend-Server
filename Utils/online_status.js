var redis = require("../Services/redis");
const onlineValue = "online";

async function setOnline(userid) {  
  try {
    const res = await redis.setAsync(userid, onlineValue);
  } catch(err) {
    console.log("redis setOnline error: ", err.message);
  }
}

async function setOffline(userid) {
  try {
    const res = await redis.delAsync(userid);
  } catch(err) {
    console.log("redis setOffline error: ", err.message);
  }
}

async function checkOnlineStatus(userid) {
  try {
    const res = await redis.getAsync(userid);
    return res === onlineValue;
  } catch(err) {
    console.log("redis checkOnlineStatus error: ", err.message);
    return false;
  }
}

module.exports = {
  setOnline,
  setOffline,
  checkOnlineStatus,
}