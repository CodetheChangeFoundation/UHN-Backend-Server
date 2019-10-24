require("dotenv").config()

var express = require("express");
var bodyParser = require("body-parser");

var app = express();
var port = process.env.PORT;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`UHN Backend Server listening on port ${port}!`))
