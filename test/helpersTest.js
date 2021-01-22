const { assert } = require('chai');

const { fetchIdByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('fetchIdByEmail', function () {
  it('should return a user with valid email', function () {
    const user = fetchIdByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.strictEqual(expectedOutput, user)
  });
  it('should return undefined with unvalid email', function () {
    const user = fetchIdByEmail("Huser@example.com", testUsers)
    const expectedOutput = undefined;
    assert.strictEqual(expectedOutput, user)
  });
});