let jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var ObjectId = require("mongodb").ObjectId;
var handle = require("../Utils/error_handling");

var UserModel = require("../Models/user").model;
var OnlineService = require("../Utils/online_status");

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

        OnlineService.setOnline(result._id.toString());

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
      console.log(process.env.SECRET);
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
    var newUser = new UserModel({ username: username, email: email, password: bcrypt.hashSync(pass, 10), phone: phone });
    await newUser.save();
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
      "phone": result.phone,
      "online": result.online
    }
    res.status(200).json(data);
  }
  else {
    handle.notFound(res, "Cannot find requested user ID in database");
  }
}



async function getResponders(req,res){
    const result = await UserModel.findOne({ _id: new ObjectId(req.params.id) }).lean();
    if(result){
      res.status(200).json({"responders": result.responders});
    }
    else {
      handle.notFound(res, "Cannot find requested user ID in database");
    }
}


async function addResponders(req,res){
  var respondersToAdd = req.body.respondersToAdd;

  if (respondersToAdd == null){
    handle.badRequest(res, "No responders requested to be added");
  }

  else{
    const user = await UserModel.findOne({ _id: new ObjectId(req.params.id)});

    var validFlag = true;
    if(user){

      for (var i=0, len = respondersToAdd.length ; i<len; i++){     //validating responders to be added

        try{
          var foundUser = await UserModel.findOne({ _id: new ObjectId(respondersToAdd[i].id)}); //
        }
        catch{
        validFlag = false; //not single String of 12 bytes or a string of 24 hex characters
        break;
        }

        if (foundUser==null){
          validFlag = false;//does not exist in database
          break;
        }
      }

       if(validFlag==true){
         for (var i=0, len = respondersToAdd.length ; i<len; i++){
           user.responders.push(respondersToAdd[i]);
           user.save();
         }
         res.status(400).json(respondersToAdd);
       }
      else{
         handle.badRequest(res, "One of responders to add is not valid"); //not single String of 12 bytes or a string of 24 hex characters or
      }

   }

    else{
      handle.notFound(res, "Cannot find requested user ID in database");
     }
   }
}

async function deleteResponder(req,res){
    var user = await UserModel.findOne({ _id: new ObjectId(req.params.id)});
    if(user){
      var responders = user.get("responders");
      let hasResponderID = responders.some(responder => responder["id"] === req.params.responderid);
      if (hasResponderID){
        user.responders.pull({id: req.params.responderid});
        user.save();
        res.status(200).send("Deletion successful");
      }
      else{
        handle.badRequest(res,"Responder is not valid to delete for this user");
      }

    }
    else{
      handle.notFound(res, "Cannot find requested user ID in database");
     }

}


async function searchUsers(req,res){
  if (req.query.online=="true"){
    try{
      var result = await UserModel.find({online: true},"username _id").lean();
      res.status(200).send(result);
    }
    catch{
      handle.internalServerError(res, "Failed to query user database");
    }
  }
  else if (req.query.online=="false"){
    try{
      var result = await UserModel.find({online: false},"username _id").lean();
      res.status(200).send(result);
    }
    catch{
      handle.internalServerError(res, "Failed to query user database");
    }
  }

  else{
    try{
      var result = await UserModel.find(null,"username _id").lean();
      res.status(200).send(result);
    }
    catch{
      handle.internalServerError(res, "Failed to query user database");
    }
  }

}

async function toggleStatus(req,res){
  if (req.body.request == "online"){
    try{
      const result = await UserModel.findOneAndUpdate({ _id: new ObjectId(req.params.id)},{online: true});
      res.status(200).send("User now online");
    }
    catch{
      handle.internalServerError(res, "Failed to find user in database");
    }
  }
  else if (req.body.request == "offline"){
    try{
      const result = await UserModel.findOneAndUpdate({ _id: new ObjectId(req.params.id)},{online: false});
      res.status(200).send("User now offline");
    }
    catch{
      handle.internalServerError(res, "Failed to find user in database");
    }
  }
  else{
    handle.badRequest(res,"Invalid status toggle request");
  }
}

module.exports = {
  signupUser, loginUser, userInfo, getResponders, addResponders, deleteResponder, searchUsers, toggleStatus
}
