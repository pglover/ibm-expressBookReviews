const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  return userswithsamename.length > 0;
};

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 }
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //get the isbn from the call
  const isbn = req.params.isbn;
  //get the review from the body
  const review = req.body.review;
  if (books[isbn]) {
    //assume that we have a username in the session if auth middleware validated user
    let username = req.session.authorization["username"];
    books[isbn].reviews[username] = review;
    res.status(200).json({ message: "Review successfully added." });
  } else {
    //book not found by ISBN, return error
    return res.status(404).json({ message: "ISBN not found" });
  }
});

//detete all reviews by a user for a given book (by ISBN)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //get the isbn from the call
  const isbn = req.params.isbn;
  if (books[isbn]) {
    //assume that we have a username in the session if auth middleware validated user
    let username = req.session.authorization["username"];
    //delete the user's review for the book (if any)
    delete books[isbn]["reviews"][username];
    res.status(200).json({ message: "Review successfully deleted." });
  } else {
    //book not found by ISBN, return error
    return res.status(404).json({ message: "ISBN not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
