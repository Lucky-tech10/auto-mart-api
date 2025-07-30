const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { dataOperations } = require("../data/store");
const generateToken = require("../utils/generateToken");
const sanitizeUser = require("../utils/sanitize");

const register = async (req, res) => {
  const { email, first_name, last_name, password, address } = req.body;

  // Check if user already exists
  const existingUser = dataOperations.findUserByEmail(email);
  if (existingUser) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  const isAdmin = dataOperations.isFirstAccount(); // Check if this is the first account
  const role = isAdmin ? "admin" : "user";

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = dataOperations.createUser({
    email,
    first_name,
    last_name,
    password: hashedPassword,
    address,
    role,
  });

  // Generate token
  const token = generateToken(newUser);

  res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    data: {
      token,
      user: sanitizeUser(newUser),
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  // Find user by email
  const user = dataOperations.findUserByEmail(email);
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  // Generate token
  const token = generateToken(user);

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
};

module.exports = {
  register,
  login,
};
