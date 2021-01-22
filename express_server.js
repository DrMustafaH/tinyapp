const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

const { generateRandomString, urlsForUser, emailInDatabase, fetchIdByEmail, cookieHasUser } = require("./helpers");


const urlDatabase = {};

const users = {};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ["Mustafa"],
  maxAge: 24 * 60 * 60 * 1000
}));




// GET routes below


// if only / is entered in url
app.get("/", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/register");
  }
});


// My URLs page of tinyapp
app.get("/urls", function (req, res) {
  if (req.session.user_id === undefined) {
    res.status(400).send("Access Denied. Please Login or Register!");
  }
  const templateVars = {
    urls: urlsForUser(req.session.user_id, users),
    email: users[req.session.user_id].email
  };
  res.render("urls_index", templateVars);
});


// Create New URL page of tinyapp
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.status(400).send("Access Denied. Please Login or Register!");
  }
  const templateVars = {
    email: users[req.session.user_id].email
  };
  res.render("urls_new", templateVars);
});


// Register page of tinyapp
app.get("/register", (req, res) => {
  const templateVars = {
    email: null
  };
  res.render("register", templateVars);
});


// Login page of tinyapp
app.get("/login", (req, res) => {
  const templateVars = {
    email: null
  };
  res.render("login", templateVars);
});


// The URL info page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longUrl,
    email: users[req.session.user_id].email
  };
  res.render("urls_show", templateVars);
});


// The link to the website page for access by non users and users
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404);
  } else {
    const longURL = urlDatabase[req.params.shortURL].longUrl;
    res.redirect(longURL);
  }
});



// POST routes below



// Add new url and takes you to url info page
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longUrl: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});



// Register page handler after register button is pressed
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const hashedPass = bcrypt.hashSync(userPass, 10);
  if (!userEmail || !userPass) {
    res.status(400).send("Please enter email and password to register!");
  } else if (emailInDatabase(userEmail, users)) {
    res.status(400).send("Email already exists, please login");
  } else {
    let randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: userEmail,
      password: hashedPass
    };
    req.session.user_id = randomID;
    return res.redirect("/urls");
  }
});


// Login page handles after login button pressed
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  if (userEmail === "" || userPass === "") {
    res.status(403).send(`Please enter valid email/password!`);
  } else if (!emailInDatabase(userEmail, users)) {
    res.status(403).send(`No account registered with this email, please register!`);
  } else {
    const userID = fetchIdByEmail(userEmail, users);
    if (!bcrypt.compareSync(userPass, users[userID].password)) {
      res.status(403).send(`Incorrect password!`);
    } else {
      req.session.user_id = userID;
      return res.redirect(`/urls`);
    }
  }
});

// Logout button handler
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});


// Delete a URL logic
app.post("/urls/:shortURL/delete", (req, res) => {
  const userUrlsDB = urlsForUser(req.session.user_id, users);
  if (Object.keys(userUrlsDB).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(401).send("You do not have authorization to delete this URL.");
  }
});


// Edit a URL logic
app.post(`/urls/:id`, (req, res) => {
  if (req.body.longURL) {
    const userUrlsDB = urlsForUser(req.session.user_id, users);
    if (Object.keys(userUrlsDB).includes(req.params.id)) {
      const shortURL = req.params.id;
      urlDatabase[shortURL].longUrl = req.body.longURL;
      res.redirect(`/urls`);
    }
  } else {
    res.status(401).send(`You do not have authorization to edit this URL.`);
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
