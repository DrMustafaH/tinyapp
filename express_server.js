const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const { request } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.set("view engine", "ejs");

// function to generate a random 6 character shortURL
const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6)
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
}

// main page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// code to show the urldatabase on the webpage
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// code just to try and make a page saying hello world (bold world)
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// my urls page of tinyapp
app.get("/urls", function (req, res) {
  const templateVars = {
    urls: urlDatabase,
    email: users[req.cookies['user_id']].email
  }
  // console.log(templateVars);
  res.render("urls_index", templateVars)
})


//when user enters username in login form it will store in cookie and redirect back to url page
app.post("/login", (req, res) => {
  let email = req.body.email;
  res.cookie('email', email);
  res.redirect(`/urls`)
})


app.post("/logout", (req, res) => {
  res.clearCookie('email');
  res.redirect(`/urls`)
})

// create new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],
    email: users[req.cookies['user_id']].email
  }
  res.render("urls_new", templateVars);
});


// get the url page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    email: users[req.cookies['user_id']].email
  };
  res.render("urls_show", templateVars);
});


// action of edit button in url_index page and the action of submit button in url_show page
app.post(`/urls/:id`, (req, res) => {
  // if the form in the url_show page contains an input(longURL) it will edit the long url and redirect you back to urls_index page
  if (req.body.longURL) {
    urlDatabase[req.params.id] = req.body.longURL
    res.redirect(`/urls`)
    // if no input was made in form it will just stay in the url_show page
  } else {
    res.redirect(`/urls/${req.params.id}`)
  }
})


// Delete url from url index page
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})


// add url to url index page
app.post("/urls", (req, res) => {
  const stringShortUrl = generateRandomString()
  urlDatabase[stringShortUrl] = req.body.longURL
  res.redirect(`/urls/${stringShortUrl}`);
});

// create register page
app.get("/register", (req, res) => {
  const templateVars = {
    email: null
  }
  res.render("register", templateVars);
});

// register page handler after register button is pressed
app.post("/register", (req, res) => {
  // console.log(users[req.body.id].email);
  // console.log(req.body.email);
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }
  let randomID = generateRandomString()
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  }
  // setting a cookie for user_id and then directing user to urls page
  res.cookie('user_id', randomID)
  res.redirect("/urls")
  // res.sendStatus(404);

})

// get an error if url was passed wrong and if not just go to the website of the longurl submitted
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404)
  } else {
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});