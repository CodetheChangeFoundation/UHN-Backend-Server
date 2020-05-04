var redis = require("./redis");
const refreshTokens = "refresh_tokens";

async function addRefreshToken(userId, refreshToken) {
  try {
    await redis.hsetAsync(refreshTokens, userId.toString(), refreshToken);
  } catch(err) {
    console.error("redis addRefreshToken error: ", err.message);
  }
}

async function checkRefreshToken(userId, refreshToken) {
  try {
    const tokenExists = await redis.hexistsAsync(refreshTokens, userId.toString());
    if (tokenExists) {
      return await redis.hgetAsync(refreshTokens, userId.toString()) == refreshToken;
    }
  } catch(err) {
    console.error("redis checkRefreshToken error: ", err.message);
  }
}

async function deleteRefreshToken(userId) {
  try {
    await redis.hdelAsync(refreshTokens, userId.toString());
  } catch(err) {
    console.error("redis deleteRefreshToken error: ", err.message);
  }
}

module.exports = {
  addRefreshToken,
  checkRefreshToken,
  deleteRefreshToken,
}
