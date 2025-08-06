const { StatusCodes } = require("http-status-codes");

const errorHandler = (err, req, res, next) => {
  let customError = {
    // set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong, try again later",
  };

  if (err.name === "MulterError") {
    customError.statusCode = StatusCodes.BAD_REQUEST;

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        customError.msg = "File too large. Max size is 1MB.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        customError.msg = "You can only upload up to 5 images.";
        break;
      case "LIMIT_FILE_COUNT":
        customError.msg = "Too many files uploaded.";
        break;
      default:
        customError.msg = err.message;
    }
  }

  // Handle fileFilter rejection (e.g., wrong file type)
  if (err.message === "Only .jpg and .png allowed") {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = "Only .jpg and .png files are allowed";
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandler;
