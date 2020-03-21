var redis = require("./redis");
const onlineUsers = "online_users"

async function setOnline(userId) {
  try {
    const res = await redis.saddAsync(onlineUsers, userId);
  } catch(err) {
    console.log("redis setOnline error: ", err.message);
  }
}

async function setOffline(userId) {
  try {
    const res = await redis.sremAsync(onlineUsers, userId);
  } catch(err) {
    console.log("redis setOffline error: ", err.message);
  }
}

async function checkOnlineStatus(userId) {
  try {
    const res = await redis.sismemberAsync(onlineUsers, userId);
    return res ? true : false;
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
