const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const { request } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");


const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6)
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", function (req, res) {
  const templateVars = { urls: urlDatabase }
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// Delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.post("/urls", (req, res) => {
  const stringShortUrl = generateRandomString()
  urlDatabase[stringShortUrl] = req.body.longURL
  res.redirect(`/urls/${stringShortUrl}`);
});

app.get("/u/:shortURL", (req, res) => {
  // console.log(req.params.shortURL);
  if (!urlDatabase[req.params.shortURL]) {
    // console.log("hello");
    res.sendStatus(404)
  } else {

    const longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});