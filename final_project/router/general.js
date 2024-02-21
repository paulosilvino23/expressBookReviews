const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {

    if (isValid(username)) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    }
    return res.status(404).json({message: "Unable to register user. INVALID USERNAME"});
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// ---------------------------------------
// Get the book list available in the shop
// ---------------------------------------
public_users.get('/',function (req, res) {

  const newPromise = new Promise((resolve, reject) => {

    try {
      resolve(res.send(JSON.stringify(books,null,4)));
    }
    catch (err) {
      reject(err);
    }
  }).then();

});

// ---------------------------------------
// Get book details based on ISBN
// ---------------------------------------
public_users.get('/isbn/:isbn',function (req, res) {

  const newPromise = new Promise((resolve, reject) => {
    try {
      const isbn = req.params.isbn;
      resolve(res.send(books[isbn]));
    }
    catch (err) {
      reject(err);
    }
  }).then();
 });
  
// ---------------------------------------
// Get book details based on author
// ---------------------------------------
public_users.get('/author/:author',function (req, res) {

  const newPromise = new Promise((resolve, reject) => {
    try {
      const author = req.params.author;
      resolve(res.send(Object.entries(books).filter(([k,v]) => v.author === author)));
    }
    catch (err) {
      reject(err);
    }
  }).then();
});

// ---------------------------------------
// Get all books based on title
// ---------------------------------------
public_users.get('/title/:title',function (req, res) {

  const newPromise = new Promise((resolve, reject) => {
    try {
      const title = req.params.title;
      resolve(res.send(Object.entries(books).filter(([k,v]) => v.title === title)));
    }
    catch (err) {
      reject(err);
    }
  }).then();
});

// ---------------------------------------
//  Get book review
// ---------------------------------------
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const review = books[isbn].reviews;
  res.send(review);
});

module.exports.general = public_users;
