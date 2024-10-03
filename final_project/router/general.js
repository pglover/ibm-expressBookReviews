const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});

//Retrieve books DB asynchronously
function getBooks() {
  return new Promise((resolve, reject) => {
    //This will probably be changed to a DB call in a future project
    if (books) {
      resolve(books);
    } else {
      reject("Cannot retrieve books DB");
    }
  });
}

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //return JSON string of all books
  getBooks()
    .then((books) => {
      res.send(JSON.stringify({ books }, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
});

//Retrieve a book by ISBN asynchronously
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    //This will probably be changed to a DB call in a future project
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(`Cannot find books ISBN: ${isbn}`);
    }
  });
}

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  // Retrieve the isbn parameter from the request URL and send the corresponding book details
  const isbn = req.params.isbn;
  getBookByISBN(isbn)
    .then((book) => {
      res.send(books[isbn]);
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
});

function filterBooks(key, value) {
  //return a promise for the book query
  return new Promise((resolve, reject) => {
    //filtered books objects down to bookers where key=value
    let ISBNs = Object.keys(books);
    let filtered_books = {};
    ISBNs.forEach((isbn) => {
      if (books[isbn][key] === value) {
        filtered_books[isbn] = books[isbn];
      }
    });
    if (Object.keys(filtered_books).length > 0) {
      //found at least one book, so resolve promise
      resolve(filtered_books);
    } else {
      //no books found for key=value
      reject(`Book with ${key} of ${value} not found`);
    }
  });
}
// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  // Retrieve the author parameter from the request URL and send the corresponding book details
  const author = req.params.author;
  filterBooks("author", author)
    .then((filtered_books) => {
      res.send(JSON.stringify(filtered_books, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  // Retrieve the title parameter from the request URL and send the corresponding book details
  const title = req.params.title;
  filterBooks("title", title)
    .then((filtered_books) => {
      res.send(JSON.stringify(filtered_books, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  // Retrieve the isbn parameter from the request URL and send the corresponding book reviews
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
