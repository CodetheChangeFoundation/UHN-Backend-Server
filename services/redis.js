var redis = require("redis");
var { promisify } = require("util");
const client = redis.createClient();

client.on("connect", () => {
  console.log("connected to redis");
});

client.on("error", (err) => {
  console.log("redis connection error: ", err);
});

const saddAsync = promisify(client.sadd).bind(client);
const sismemberAsync = promisify(client.sismember).bind(client);
const sremAsync = promisify(client.srem).bind(client);
const hsetAsync = promisify(client.hset).bind(client);
const hexistsAsync = promisify(client.hexists).bind(client);
const hgetAsync = promisify(client.hget).bind(client);
const hdelAsync = promisify(client.hdel).bind(client);
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
  saddAsync,
  sismemberAsync,
  sremAsync,
  hsetAsync,
  hexistsAsync,
  hgetAsync,
  hdelAsync,
}