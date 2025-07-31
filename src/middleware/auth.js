const jwt = require("jsonwebtoken");
const { dataOperations } = require("../data/store");
const CustomError = require("../errors");
const sanitizeUser = require("../utils/sanitize");

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const existingUser = dataOperations.findUserById(user.id);
    if (!existingUser) {
      throw new CustomError.UnauthenticatedError("User no longer found");
    }
    req.user = sanitizeUser(existingUser);
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
};

module.exports = {
  authMiddleware,
};
