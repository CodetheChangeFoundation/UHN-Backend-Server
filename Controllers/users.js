require("dotenv").config({ path: __dirname + "/.env" });
var database = require("../database");
var mongoose = database.getmongoose();
var Schema = mongoose.Schema;
let jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var ObjectId = require("mongodb").ObjectId;
var handle = require("../Utils/error_handling");

const UserModel = mongoose.model("users", new Schema({ username: String, password: String, email: String, phone: String }));

async function loginUser(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var data = {
    "username": username,
    "password": password,
  }

  try {
    console.log({ username: data.username, password: data.password });
    var result = await UserModel.findOne({ username: username }, "password").lean();
    console.log(result);
  }
  catch (err) {
    handle.notFound(res, "Cannot find requested username in database");
  };

  if (result != null) {
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
      }
      else {
        handle.unauthorized(res, "Password incorrect");
      }
    }
    catch (err) {
      handle.internalServerError(res, "Bcrypt compareSync failed");
    }
  }
  else {
    handle.notFound(res, "Cannot find requested user ID in database");
  }
}


async function signupUser(req, res) {
  var username = req.body.username;
  var email = req.body.email;
  var pass = req.body.password;
  var phone = req.body.phone;

  try {
    var insert = new UserModel({ username: username, email: email, password: bcrypt.hashSync(pass, 10), phone: phone });
    await insert.save();
    console.log("Record inserted Successfully");
    res.status(200).json({ "username": username, "email": email, "phone": phone });
  }
  catch (err) {
    handle.internalServerError(res, "Insert user failed");
  };

};


async function userInfo(req, res) {
  const result = await UserModel.findOne({ _id: new ObjectId(req.params.id) }).lean();

  if (result) {
    var data = {
      "username": result.username,
      "email": result.email,
      "phone": result.phone
    }
    res.status(200).json(data);
  }
  else {
    handle.notFound(res, "Cannot find requested user ID in database");
  }
}

module.exports = {
  signupUser, loginUser, userInfo
}
