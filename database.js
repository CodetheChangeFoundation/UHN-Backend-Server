const mongoose = require("mongoose");
var db = null;

function connect(){
  mongoose.connect("mongodb://localhost/signup");
  db=mongoose.connection;
  db.on("error", console.log.bind(console, "connection error"));
  db.once("open", function(callback){
      console.log("connection succeeded");
  })
}

function getdb(){
  return db;
}
module.exports = {
  connect : connect,
  getdb : getdb
}
