var redis = require("./redis");
const refreshTokens = "refresh_tokens";

async function addRefreshToken(userId, refreshToken) {
  try {
    const res = await redis.hsetAsync(refreshTokens, refreshToken, userId);
  } catch(err) {
    console.log("redis addRefreshToken error: ", err.message);
  }
}

module.exports = {
  addRefreshToken
}
