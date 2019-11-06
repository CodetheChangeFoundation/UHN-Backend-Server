function retrievalError(req,res){
      res.status(404).json({
        "Message": "Failed retrieve from database",
        "Details": "Backend database error in searching for username in database"
      });
}

function unauthorizedError(req,res){
   console.log("Failed to authorize");
   res.status(401).json({
     "Message": "Unauthorized",
     "Details": "Password incorrect"
   })
    res.status(401).send("Unauthorized");
}

function failedComparisonError(req,res){
  res.status(500).json({
      "Message": "Internal Server Error",
      "Details": "Bcrypt failed to compare to the hashed password in the database"
  });
}

function failedUserInsertionError(req,res){
    res.status(505).json({
      "Message": "Internal Server Error",
      "Details":  "Failed to insert user from signup"
    });
}

function userNotFound(req,res){
    res.status(404).json({
      "Message": "User ID not found",
      "Details": "Cannot find requested user ID in database"
    });
}

module.exports = {
  retrievalError, unauthorizedError, failedComparisonError, failedUserInsertionError, userNotFound
}
