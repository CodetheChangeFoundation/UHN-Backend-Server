var knex = require("knex")
let metricDB;
let connected = false;

async function connect() {
  metricDB = knex({
    client: "pg",
    connection: process.env.DATABASE_URL
  });

  //TODO: find a better way to test connection
  try {
    await metricDB.raw("SET timezone=\"UTC\";");
    console.log("connected to PostgreSQL")
    connected = true;
  } catch (err) {
    console.log("error connecting to PostgreSQL")
    connected = false;
  }
}

function getMetrics() {
  return metricDB;
}

function isConnected() {
  return connected;
}

module.exports = {
  isConnected: isConnected,
  connect: connect,
  getMetrics: getMetrics
};