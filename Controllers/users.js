require("dotenv").config({path: __dirname + "/process.env"})
database = require("../database");
var db = database.getdb();
let jwt = require("jsonwebtoken");
let middleware = require("../middleware");
var bcrypt = require('bcrypt');

async function loginUser(req,res){
  var username = req.body.username;
  var password = req.body.password;

  var data = {
      "username": username,
      "password":password,
  }

  try {
    console.log({username:data.username,password:data.password});
    var result = await db.collection("details").findOne({username: data.username});
  }
    catch (err){
      console.log(err);
      res.status(404).send("Failed retrieve");
  };

  try{
    const match = await bcrypt.compare(result.password,password);
    if(match){
      let token = jwt.sign({username: data.username},
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

    else{
      res.status(401).send("Unauthorized");
    }
  }

  catch{
    console.log("Failed compare");
  }
}


async function signupUser(req,res){
    var name = req.body.name;
    var username = req.body.username;
    var email =req.body.email;
    var pass = req.body.password;
    var phone =req.body.phone;

    var data = {
      "name": name,
      "username":username,
      "email":email,
      "password":pass,
      "phone":phone
      }

    db.collection("details").insertOne(data,function(err, collection){
      if (err) throw err;
      console.log("Record inserted Successfully");
      res.status(200).json({"name": name, "username":username, "email":email, "phone":phone});
    });
}

async function userInfo(req,res){
  const result = await db.collection("details").findOne({username: req.decoded.username});
  if(req.params.id==result._id){
      res.status(200).send(result);
  }
  else{
    res.status(404).send("User ID not found");
  }


}

module.exports = {
  signupUser,loginUser,userInfo
}
