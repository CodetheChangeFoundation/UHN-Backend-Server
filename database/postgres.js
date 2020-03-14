var knex = require("knex")
let metricDB;

async function connect() {
  metricDB = knex({
    client: "pg",
    connection: process.env.DATABASE_URL
  });

  //TODO: find a better way to test connection
  try {
    await metricDB.raw("SET timezone=\"UTC\";");
    console.log("connected to PostgreSQL")
  } catch (err) {
    console.log("error connecting to PostgreSQL")
  }
}

function getMetrics() {
  return metricDB;
}

module.exports = {
  connect: connect,
  getMetrics: getMetrics
};