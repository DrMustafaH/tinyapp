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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "2" },
  "9sm5xK": { longURL: "http://www.cnn.com", userID: "1" }
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
  "1": {
    id: "1",
    email: "hello@world.com",
    password: "123"
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


// my urls page of tinyapp
app.get("/urls", function (req, res) {
  if (req.cookies['user_id'] === undefined) {
    res.status(400).send("Access Denied. Please Login or Register!")
  }
  const templateVars = {
    urls: urlDatabase,
    email: users[req.cookies['user_id']].email
  }
  res.render("urls_index", templateVars)
})

app.get("/login", (req, res) => {
  const templateVars = {
    email: null
  }
  res.render("login", templateVars);
})

//when user enters username in login form it will store in cookie and redirect back to url page
app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(403);
  }

  let userExists = false;
  for (const userID in users) {
    const userInfoObj = users[userID]
    if (userInfoObj.email === req.body.email && userInfoObj.password === req.body.password) {
      userExists = true
      res.cookie('user_id', users[userID].id);
      res.redirect(`/urls`);
      return;
    }
  }
  res.sendStatus(403);
})


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/login`)
})

// create new url page
app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id'] === undefined) {
    res.status(400).send("Access Denied. Please Login or Register!")
  }
  const templateVars = {
    email: users[req.cookies['user_id']].email
  }
  res.render("urls_new", templateVars);
});


// get the url page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
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
  urlDatabase[stringShortUrl] = { longUrl: req.body.longURL, userID: req.cookies['user_id'] }
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
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }
  let userExist = false;
  for (const usersId in users) {
    const usersInfo = users[usersId];
    if (usersInfo.email === req.body.email) {
      userExist = true;
    }
  }
  if (!userExist) {
    let randomID = generateRandomString()
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    }
    // setting a cookie for user_id and then directing user to urls page
    res.cookie('user_id', randomID)
    res.redirect("/urls")
    return;
  }
  res.sendStatus(400)
})

// get an error if url was passed wrong and if not just go to the website of the longurl submitted
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404)
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL
    res.redirect(longURL);
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// const templateVars = {
//   urls: urlDatabase
// }
// if (!templateVars.email) {
//   const templateVars = {
//     urls: urlDatabase,
//     email: null
//   }
//   res.render("urls_index", templateVars)
// } else {
//   const templateVars = {
//     urls: urlDatabase,
//     email: users[req.cookies['user_id']].email
//   }
//   res.render("urls_index", templateVars)
// }