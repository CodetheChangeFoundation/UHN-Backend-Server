require("dotenv").config();
var database = require("../database");
var db = database.getdb();
let jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var ObjectId = require('mongodb').ObjectId; 

async function loginUser(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var data = {
    "username": username,
    "password": password,
  }

  try {
    console.log({ username: data.username, password: data.password });
    var result = await db.collection("users").findOne({ username: data.username });
  }
  catch (err) {
    console.log(err);
    res.status(404).send("Failed retrieve");
  };

  try {
    if (bcrypt.compareSync(data.password, result.password)) {
      let token = jwt.sign({ username: data.username },
        process.env.SECRET,
        {
          expiresIn: "24h"
        }
      );

      res.status(200).json({
        success: true,
        message: "Authentication successful!",
        token: token,
        id: result._id
      })
      console.log("Successful login");
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (err) {
    console.log("Failed compare");
    res.status(500).send("Internal Server Error");
  }
}


async function signupUser(req, res) {
  var username = req.body.username;
  var email = req.body.email;
  var pass = req.body.password;
  var phone = req.body.phone;

  var data = {
    "username": username,
    "email": email,
    "password": bcrypt.hashSync(pass, 10),
    "phone": phone
  }

  db.collection("users").insertOne(data, function (err, collection) {
    if (err) {
      res.status(500).send("Internal Server Error");
    };
    console.log("Record inserted Successfully");
    res.status(200).json({ "username": username, "email": email, "phone": phone });
  });
}

async function userInfo(req, res) {
  const result = await db.collection("users").findOne({ _id: new ObjectId(req.params.id) });
  
  if (result) {
    res.status(200).send(result);
  }
  else {
    res.status(404).send("User ID not found");
  }
}

module.exports = {
  signupUser, loginUser, userInfo
}
