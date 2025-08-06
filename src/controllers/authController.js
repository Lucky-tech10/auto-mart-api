const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { dataOperations } = require("../data/store");
const generateToken = require("../utils/generateToken");
const sanitizeUser = require("../utils/sanitize");
const sendResetPassswordEmail = require("../utils/sendResetPasswordEmail");
const crypto = require("crypto");
const createHash = require("../utils/createHash");

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

// Request password reset
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email)
    throw new CustomError.BadRequestError("Please provide valid email");

  const user = dataOperations.findUserByEmail(email);

  if (user) {
    // Generate and hash token
    const resetToken = crypto.randomBytes(70).toString("hex");
    const resetTokenHash = createHash(resetToken);

    // Send reset email
    await sendResetPassswordEmail({
      name: user.first_name,
      email: user.email,
      token: resetToken,
      origin: process.env.FRONTEND_URL,
    });

    // Store reset token
    dataOperations.createResetToken(user.id, user.email, resetTokenHash);

    // Clean expired tokens
    dataOperations.cleanupExpiredTokens();

    if (process.env.NODE_ENV === "development") {
      console.log("Reset token :", resetToken);
      console.log("Reset token :", resetTokenHash);
    }
  }

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    message: "Password reset token created",
  });
};

const resetPassword = async (req, res) => {
  const { token, email, new_password } = req.body;
  if (!token || !email || !new_password) {
    throw new CustomError.BadRequestError("Please provide all required fields");
  }

  dataOperations.cleanupExpiredTokens();

  const user = dataOperations.findUserByEmail(email);
  if (!user) {
    throw new CustomError.NotFoundError("User not found");
  }

  const resetTokenHash = createHash(token);
  const isValidToken = dataOperations.verifyResetToken(email, resetTokenHash);

  if (!isValidToken || new Date(isValidToken.expires_at) < new Date()) {
    throw new CustomError.UnauthenticatedError(
      "Invalid or expired reset token"
    );
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(new_password, 10);

  // Update user's password
  dataOperations.updateUser(user.id, { password: hashedPassword });

  // Delete used token
  dataOperations.deleteResetToken(resetTokenHash);

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    message: "Password has been reset successfully",
  });
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
};
