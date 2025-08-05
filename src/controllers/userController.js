const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { dataOperations } = require("../data/store");
const bcrypt = require("bcryptjs");

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updatePassword = async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  const userId = req.user.id;

  if (!current_password || !new_password || !confirm_password) {
    throw new CustomError.BadRequestError("All fields are required");
  }
  if (new_password !== confirm_password) {
    throw new CustomError.BadRequestError(
      "New password and confirmation do not match"
    );
  }
  const user = dataOperations.findUserById(userId);

  if (!user) {
    throw new CustomError.NotFoundError("User not found");
  }
  const isMatch = await bcrypt.compare(current_password, user.password);
  if (!isMatch) {
    throw new CustomError.UnauthenticatedError("Current password is incorrect");
  }
  const hashedPassword = await bcrypt.hash(new_password, 10);
  dataOperations.updateUser(userId, { password: hashedPassword });
  res.status(StatusCodes.OK).json({ message: "Password updated successfully" });
};

module.exports = {
  showCurrentUser,
  updatePassword,
};
