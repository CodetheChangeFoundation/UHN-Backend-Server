var redis = require("./redis");
const refreshTokens = "refresh_tokens";

async function addRefreshToken(userId, refreshToken) {
  try {
    await redis.hsetAsync(refreshTokens, refreshToken, userId.toString());
  } catch(err) {
    console.error("redis addRefreshToken error: ", err.message);
  }
}

async function checkRefreshToken(userId, refreshToken) {
  try {
    const tokenExists = await redis.hexistsAsync(refreshTokens, refreshToken);
    if (tokenExists) {
      return await redis.hgetAsync(refreshTokens, refreshToken) == userId.toString();
    }
  } catch(err) {
    console.error("redis checkRefreshToken error: ", err.message);
  }
}

async function deleteRefreshToken(refreshToken) {
  try {
    await redis.hdelAsync(refreshTokens, refreshToken);
  } catch(err) {
    console.error("redis deleteRefreshToken error: ", err.message);
  }
}

module.exports = {
  addRefreshToken,
  checkRefreshToken,
  deleteRefreshToken,
}
