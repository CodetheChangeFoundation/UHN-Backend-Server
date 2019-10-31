import chai from "chai";
import chaiHttp from "chai-http";
import bcrypt from "bcrypt";
import app from "../server";
var database = require("../database");
var db = database.getdb();

chai.use(chaiHttp);
chai.should();

const SALT_ROUNDS = 10;

describe("Sign up and Login", () => {
  const username = "TEST_USER_1";
  const email = "testuser@gmail.com";
  const phone = "7781231234";
  const plainTextPassword = "testuser1password";
  var hashedPassword = "";
  var token = "";
  var userId = "";

  before(() => {
    hashedPassword = bcrypt.hashSync(plainTextPassword, bcrypt.genSaltSync(SALT_ROUNDS));
    console.log("Processed before()");
  })

  it("should sign up user", (done) => {
    chai.request(app)
      .post("/signup")
      .send({ 
        username: username, 
        email: email,
        password: hashedPassword,
        phone: phone,
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        done();
      })
  })

  it("should authenticate with correct credentials", (done) => {
    chai.request(app)
      .post("/login")
      .send({ username: username, password: hashedPassword })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        userId = res.body.id;
        token = res.body.token;
        console.log(token, userId);
        done();
      })
  })

  it("should retrieve user profile info with token", (done) => {
    chai.request(app)
      .get(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        console.log(res.body);
        done();
      })
  })

  after(async () => {
    try {
      await db.collection("users").remove({ username: username })
      console.log("Processed after()");
    } catch (err) {
      console.log("Failed to delete created user");
    }
  })
})