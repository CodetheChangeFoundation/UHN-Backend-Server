const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
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

function isConnected() {
  return mongoose.connection.readyState === 1;
}

function getmongoose() {
  return mongoose;
}

module.exports = {
  isConnected: isConnected,
  connect: connect,
  getdb: getdb,
  getmongoose: getmongoose
};
