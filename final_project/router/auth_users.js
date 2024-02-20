const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  
  if (username.length > 30) {
    return false;
  }
  
  return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: username
    }, 'access', { expiresIn: 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  
  if(req.session.authorization) {
      token = req.session.authorization['accessToken'];
      jwt.verify(token, "access",(err,user)=>{
          if(!err){
              req.user = user;
          }
          else{
              return res.status(403).json({message: "User not authenticated"})
          }
      });
  } else {
      return res.status(403).json({message: "User not logged in"})
  }

  // User is logged in
  const isbn = req.params.isbn;

  let book = books[isbn];

  let oldReview, newReview, loggedUser;

  // Book does not exists, return error
  if (!book) {
    return res.status(404).json({message: "Book not found"})
  }

  loggedUser = req.user.data;

  oldReview = book.reviews[loggedUser];
  newReview = req.body.review;

  book.reviews[loggedUser] = newReview;

  return res.status(200).json({})

});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

  if(req.session.authorization) {
    token = req.session.authorization['accessToken'];
    jwt.verify(token, "access",(err,user)=>{
        if(!err){
            req.user = user;
        }
        else{
            return res.status(403).json({message: "User not authenticated"})
        }
    });
  } else {
      return res.status(403).json({message: "User not logged in"})
  }

  // User is logged in
  const isbn = req.params.isbn;

  let book = books[isbn];

  // Book does not exists, return error
  if (!book) {
    return res.status(404).json({message: "Book not found"})
  }

  loggedUser = req.user.data;

  delete books[isbn].reviews[loggedUser];

  return res.status(200).json({})
  
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
