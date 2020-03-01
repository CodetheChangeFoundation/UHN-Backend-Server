require("dotenv").config({ path: __dirname + "/.env" });
const InitializationService = require("./services/initialization.service");
InitializationService.initialize();
const { validateSignup, validateLogin } = require("./utils/error_handling");
const user = require("./controllers/user");
const alarmMetrics = require("./controllers/metrics/alarm");
const notification = require("./controllers/notification");
const help_request = require("./controllers/help_request")
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

app.get("/", (req, res) => res.send("Server is up"))

app.post("/signup", validateSignup(), user.signupUser);
app.post("/login", validateLogin(), user.loginUser);

app.post("/users/:id/responders", middleware.checkToken, user.addResponders);

app.post("/users/:id/notification-token", user.addPushToken);

app.put("/users/:id/location", middleware.checkToken, user.updateLocation);
app.get("/users/:id/location", middleware.checkToken, user.getLocation);

app.post("/users/:id/status", middleware.checkToken, user.toggleStatus);

app.get("/users/search", middleware.checkToken, user.searchUsers);

app.get("/users/:id", middleware.checkToken, user.userInfo);
app.get("/users/:id/responders", middleware.checkToken, user.getResponders);
app.get("/users/:id/responders/count", middleware.checkToken, user.getResponderCount);
app.delete("/users/:id/responders", middleware.checkToken, user.deleteResponders);

// Help requests
app.post("/help-requests/", middleware.checkToken, help_request.addHelpRequest);
app.put("/help-requests/:id", middleware.checkToken, help_request.putHelpRequest);
app.get("/help-requests/:id/responders/count",middleware.checkToken,help_request.getHelpRequestResponderCount)

// Alarm metrics
app.post("/metrics/alarm", middleware.checkToken, alarmMetrics.alarmStart);
app.put("/metrics/alarm/:alarmID", middleware.checkToken, alarmMetrics.alarmUpdate);

// FOR TESTING ONLY
app.get("/test-notif", notification.testSendNotification);

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});

export default app;
