var redis = require("./redis");
const onlineUsers = "online_users"

async function setOnline(userId) {
  try {
    await redis.saddAsync(onlineUsers, userId.toString());
  } catch(err) {
    console.error("redis setOnline error: ", err.message);
  }
}

async function setOffline(userId) {
  try {
    await redis.sremAsync(onlineUsers, userId.toString());
  } catch(err) {
    console.error("redis setOffline error: ", err.message);
  }
}

async function checkOnlineStatus(userId) {
  try {
    const res = await redis.sismemberAsync(onlineUsers, userId.toString());
    return res ? true : false;
  } catch(err) {
    console.error("redis checkOnlineStatus error: ", err.message);
    return false;
  }
}

module.exports = {
  setOnline,
  setOffline,
  checkOnlineStatus,
}
