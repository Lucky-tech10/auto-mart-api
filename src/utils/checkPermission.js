const CustomError = require("../errors");

function checkPermissions(requestUser, resourceUserId) {
  // Only the owner can access
  if (requestUser.id === resourceUserId.toString()) return;

  throw new CustomError.UnauthorizedError(
    "Not authorized to access this resource"
  );
}

module.exports = checkPermissions;
