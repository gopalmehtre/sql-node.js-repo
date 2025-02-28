const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "delta_app",
    password: "Gopal1027",
  });


  let getRandomUser = () => {
    return [
      faker.string.uuid(),
      faker.internet.username(), // before version 9.1.0, use userName()
      faker.internet.email(),
      faker.internet.password(),
    ];
  };

  


 



// connection.end();

//HOME PAGE ROUTE
app.get("/", (req, res)=>{
  let q = "SELECT count(*) FROM user";
  try{
    connection.query(q , (err, result)=> {
        if (err) throw err;
        let count = result[0] ["count(*)"];
        res.render("home.ejs", {count});
      });
    } catch (err) {
      console.log(err);
      res.send("some error in DB");
  }
});

//SHOW ROUTE
app.get("/user", (req, res)=> {
  let q = "SELECT * FROM user"; 
  try{
    connection.query(q , (err, users)=> {
        if (err) throw err;
        // console.log(result);
        res.render("showusers.ejs", {users});
      });
    } catch (err) {
      console.log(err);
      res.send("some error in DB");
  }
});

// edit route 
app.get("/user/:id/edit" , (req, res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id= '${id}'`;

  try{
    connection.query(q , (err, result)=> {
        if (err) throw err;
        let user = result[0];
        res.render("edit.ejs", {user});
      });
    } catch (err) {
      console.log(err);
      res.send("some error in DB");
  }
})

// UPDATE ROUTE 
app.patch("/user/:id", (req, res)=>{
  let {id} = req.params;
  let {password: formPass, username: newUsername} = req.body;
  let q = `SELECT * FROM user WHERE id= '${id}'`;

  try{
    connection.query(q , (err, result)=> {
        if (err) throw err;
        let user = result[0];
        if(formPass != user.password){    //authentication step
          res.send("wrong password");
        }else{
          let q2 = `UPDATE user SET username= '${newUsername}' WHERE id= '${id}' `;
          connection.query(q2, (err, result)=> {
            if (err) throw err;
            res.send(result);
          })
        }
      });
    } catch (err) {
      console.log(err);
      res.send("some error in DB");
  }
})

// ADD USER 
app.get("/user/new", (req, res)=>{
  res.render("new.ejs");
});

app.post("/user", (req, res)=>{
  let {id, username, email, password} = req.body;
  let q = "INSERT INTO user (id, username, email, password) values(?, ?, ?, ?)";
  try{
    connection.query(q, [id, username, email, password], (err, result)=>{
      if (err) {
        console.error("Error inserting data:", err);
        res.send("Error adding user.");
    } else {
        res.send("User added successfully!");
    }
    })
  } catch(err) {
    console.log(err);
    res.send("some error in DB");
  }
});

app.get("/user/:id/delete", (req, res) => {
  res.render("delete.ejs");
});

app.post("/user/:id", (req, res) => {
  let { email, password } = req.body;
  let q = "SELECT * FROM user WHERE email = ? AND password = ?";

  try {
    connection.query(q, [email, password], (err, results) => {
      if (err) {
        console.error(err);
        return res.send("Database error occurred.");
      }

      if (results.length > 0) {
        let q2 = "DELETE FROM user WHERE email = ?";
        connection.query(q2, [email], (delErr) => {
          if (delErr) {
            console.error(delErr);
            return res.send("Error deleting user.");
          }

          res.send("User deleted successfully!");
          res.redirect("/user");
        });
      } else {
        res.send("Incorrect email or password.");
      }
    });
  } catch (err) {
    console.error(err);
    res.send("Some error in DB.");
  }
});


app.listen("8080", ()=> {
  console.log("server is listening to port 8080");
});

 