const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/databaseName";

const User = require("./models/User");

const authenticateUser = require("./middlewares/authenticateUser");

const app = express();

require('./startup/db')();
require('./startup/middleware')(app);

// cookie session
app.use(
  cookieSession({
    keys: ["randomStringASyoulikehjudfsajk"],
  })
);

// route for serving frontend files
app
  .get("/", (req, res) => {
    res.render("index");
  })
  app.get("/login", (req, res) => {
    res.render("login");
  })
  app.get("/delete", (req, res) => {
    res.render("delete");
  })
  app.get("/register", (req, res) => {
    res.render("register");
  })

  app.get("/home", authenticateUser, (req, res) => {
    res.render("home", { user: req.session.user });
  });

// route for handling post requirests
app
  .post("/login", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) return res.send("Please enter all the fields");

    const doesUserExits = await User.findOne({ email });

    if (!doesUserExits) return res.send("invalid username or password");

    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExits.password
    );

    if (!doesPasswordMatch) return res.send("invalid useranme or password");

    // else he\s logged in
    req.session.user = {
      email,
    };

    res.redirect("/home");
  })

  //for deleting
  app.post('/delete' , async (req,res)=>{
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) return res.send("Please enter all the fields");

    const doesUserExits = await User.findOne({ email });

    if (!doesUserExits) return res.send("id doesnot exist");

    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExits.password
    );

    if (!doesPasswordMatch) return res.send("id doesnot exist");



    // lets hash the password
    const latestUser = new User({ email, password });

    latestUser
      .remove()
      .then(() => {
      
MongoClient.connect(url, function(err, db) {  
if (err) throw err;  
db.collection("users").remove(req.body, function(err, obj) {  
if (err) throw err;  
console.log(obj.result.n + " record(s) deleted");  
db.close();  
});  
});
  
        console.log("successfully deleted")
        res.send("deleted account!")
        // res.redirect("/login");
      })
   
      .catch((err) => console.log("oh no",err));
 
  })



  
// for registration
  app.post("/register", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) return res.send("Please enter all the fields");

    const doesUserExitsAlready = await User.findOne({ email });

    if (doesUserExitsAlready) return res.send("A user with that email already exits please try another one!");

    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new User({ email, password: hashedPassword });

    latestUser
      .save()
      .then(() => {
  
        console.log("successfully registered")
      
        res.redirect("/login");
      })
   
      .catch((err) => console.log("oh no",err));
 
  })
  
//logout
app.get("/logout", authenticateUser, (req, res) => {
  req.session.user = null;
  res.redirect("/login");
});



// server config
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started listening on port: ${PORT}`);
});
