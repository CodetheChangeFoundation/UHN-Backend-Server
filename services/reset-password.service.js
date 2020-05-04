const redis = require("./redis");
const bcrypt = require("bcrypt");
const temporaryPasswords = "temporary_passwords";

function createTemporaryPassword() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = characters.length;

  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * length));
  }

  return result;
}

async function applyTemporaryPassword(username) {
  const temporaryPassword = createTemporaryPassword();
  try {
    await redis.hsetAsync(
      temporaryPasswords,
      username.toString(),
      bcrypt.hashSync(temporaryPassword, 10)
    );
    return temporaryPassword;
  } catch (err) {
    console.error("redis applyTemporaryPassword error: ", err.message);
  }
}

async function getTemporaryPassword(username) {
  try {
    return await redis.hgetAsync(temporaryPasswords, username.toString());
  } catch (err) {
    console.error("redis getTemporaryPassword error: ", err.message);
  }
}

async function removeTemporaryPassword(username) {
  try {
    await redis.hdelAsync(temporaryPasswords, username.toString());
  } catch (err) {
    console.error("redis removeTemporaryPassword error: ", err.message);
  }
}

module.exports = {
  applyTemporaryPassword,
  getTemporaryPassword,
  removeTemporaryPassword,
};
