const { v4: uuidv4 } = require("uuid");

const storage = {
  users: [],
};

// Helper functions for data operations
const dataOperations = {
  // first registered user is an admin
  isFirstAccount: () => storage.users.length === 0,

  // User operations
  createUser: (userData) => {
    const newUser = {
      id: uuidv4(),
      ...userData,
      created_on: new Date().toISOString(),
    };
    storage.users.push(newUser);
    return newUser;
  },

  findUserByEmail: (email) =>
    storage.users.find((user) => user.email === email),

  findUserById: (id) => storage.users.find((user) => user.id === id),
};

module.exports = {
  dataOperations,
};
