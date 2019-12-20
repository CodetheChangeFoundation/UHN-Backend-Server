const mongoose = require("mongoose");
var db = null;

function connect() {
  mongoose.connect("mongodb://localhost/uhn-database", {
    useNewUrlParser: true
  });
  db = mongoose.connection;
  db.on("error", console.log.bind(console, "connection error"));
  db.once("open", function(callback) {
    console.log("connected to database");
  });
}

function getdb() {
  return db;
}

function getmongoose() {
  return mongoose;
}

module.exports = {
  connect: connect,
  getdb: getdb,
  getmongoose: getmongoose
};
