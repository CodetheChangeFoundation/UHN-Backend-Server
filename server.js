require("dotenv").config({path: __dirname + "/.env"});
const database = require("./database");
database.connect();
const { validateSignup, validateLogin } = require("./Utils/error_handling");
const user = require("./Controllers/user");
var express = require("express");
var bodyParser = require("body-parser");
let middleware = require("./middleware");
const port = process.env.PORT || 3000;
const app = express()
app.use(express.static(__dirname + "/../public"));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post("/signup", validateSignup(), user.signupUser);
app.post("/login", validateLogin(), user.loginUser);

app.post("/users/:id/responders", middleware.checkToken, user.addResponders);

app.put("/users/:id/location", middleware.checkToken, user.updateLocation);
app.get("/users/:id/location", middleware.checkToken, user.getLocation);

app.post("/users/:id/status", middleware.checkToken, user.toggleStatus);

app.get("/users/search", middleware.checkToken, user.searchUsers);

app.get("/users/:id", middleware.checkToken, user.userInfo);
app.get("/users/:id/responders", middleware.checkToken, user.getResponders);
app.get("/users/:id/responders/count",middleware.checkToken,user.getResponderCount);
app.delete("/users/:id/responders/:responderid", middleware.checkToken, user.deleteResponder);

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});

export default app;
