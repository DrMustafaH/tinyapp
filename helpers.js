// Function to generate random ID
const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
}


// Function to create a database of specific user URLs
const urlsForUser = function (id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    const urlInfoObj = urlDatabase[shortURL];
    if (urlInfoObj.userID === id) {
      userUrls[shortURL] = urlInfoObj;
    }
  }
  return userUrls;
}


// Function to check if email is in database
const emailInDatabase = function (email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
};


// Function to fetch the user ID by using the email
const fetchIdByEmail = function (email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

// Check if the cookie has a user
const cookieHasUser = function (cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
};

module.exports = {
  generateRandomString,
  urlsForUser,
  emailInDatabase,
  fetchIdByEmail,
  cookieHasUser
}