var redis = require("redis");
var { promisify } = require("util");
const client = redis.createClient();

client.on("connect", () => {
  console.log("connected to redis");
});

client.on("error", (err) => {
  console.log("redis connection error: ", err);
});

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);
const pingAsync = promisify(client.ping).bind(client);

function getClient() {
  return client;
}

async function isHealthy() {
  try {
    const res = await pingAsync();
    return res === "PONG"
  } catch(err) {
    return false;
  }
}

module.exports = {
  getClient,
  isHealthy,
  getAsync,
  setAsync,
  delAsync,
}