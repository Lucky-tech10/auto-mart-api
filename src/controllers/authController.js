const register = (req, res) => {
  // Logic to register a user
  res.send("User registered successfully!");
};

const login = (req, res) => {
  // Logic to register a user
  res.send("User login successfully!");
};

module.exports = {
  register,
  login,
};
