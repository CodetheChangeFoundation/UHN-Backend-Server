import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server";
var database = require("../database");
var db = database.getdb();

chai.use(chaiHttp);
chai.should();

describe("Sign up and Login", () => {
  const username = "TEST_USER_1";
  const email = "testuser@gmail.com";
  const phone = "7781231234";
  const plainTextPassword = "testuser1password";
  var token = "";
  var userId = "";

  it("should sign up user", (done) => {
    chai.request(app)
      .post("/signup")
      .send({
        username: username,
        email: email,
        password: plainTextPassword,
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
      .send({ username: username, password: plainTextPassword })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        userId = res.body.id;
        token = res.body.token;
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
        done();
      })
  })


  after(async () => {
    try {
      await db.collection("users").deleteOne({ username: username })
      console.log("Processed after()");
    } catch (err) {
      console.log("Failed to delete created user");
    }
  })
})

describe("Create 2 accounts and tests for search and responding",() => {

  var token = "";
  var userId = "";

  it("should sign up user A", (done) => {
    chai.request(app)
      .post("/signup")
      .send({
        username: "Ausername",
        email: "A@gmail.com",
        password: "Auserpassword",
        phone: "12345678"
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        done();
      })
    })

  it("should sign up user B", (done) => {
    chai.request(app)
      .post("/signup")
      .send({
        username: "Busername",
        email: "B@gmail.com",
        password: "Buserpassword",
        phone: "988655332"
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        done();
      })
    })


  it("should authenticate A with correct credentials", (done) => {
    chai.request(app)
      .post("/login")
      .send({ username: "Ausername", password: "Auserpassword" })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        userId = res.body.id;
        token = res.body.token;
        done();
      })
  })

  var users = [];
  var BuserID;

  it("should have B as one of the users being shown up", (done) =>{
    chai.request(app)
      .get("/users/search")
      .set("Authorization", `Bearer ${token}`)
      .end((err,res)=> {
        res.should.have.status(200);
        console.log(res.body);
        res.body.forEach((user)=>{
          users.push(user.username);
          if(user.username==="Busername")
            BuserID = user._id;
        });
        users.should.include("Busername");
        done();
      })
  })

  it("should add B as a responder for user A", (done) =>{
    let respondersToAddArr = [{id: BuserID}];
    console.log(respondersToAddArr);
    chai.request(app)
      .post("/users/${userId}/responders")
      .set("Authorization", `Bearer ${token}`)
      .send({respondersToAdd: respondersToAddArr})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        done();
      })
  })


after(async () => {
  try {
    await db.collection("users").deleteMany({username: { $in: ["Busername","Ausername"]}});
    console.log("Processed after()");
  } catch (err) {
    console.log("Failed to delete created user");
  }

})

})
