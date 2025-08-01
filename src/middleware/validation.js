const { body, validationResult } = require("express-validator");

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

// User validation rules
const validateRegister = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("first_name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("last_name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address must not exceed 200 characters"),
  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Car validation
const validateCreateCar = [
  body("make").trim().notEmpty().withMessage("Manufacturer is required"),
  body("model").trim().notEmpty().withMessage("Model is required"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number")
    .toFloat(),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["available", "sold"])
    .withMessage('Status must be either "available" or "sold"'),
  body("state")
    .notEmpty()
    .withMessage("State is required")
    .isIn(["new", "used"])
    .withMessage('State must be either "new" or "used"'),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("body_type").trim().notEmpty().withMessage("Body type is required"),
  handleValidationErrors,
];

const validateSingleCar = [
  body("id").isUUID().withMessage("Invalid car ID format"),
  handleValidationErrors,
];

const validateUpdateCarPrice = [
  body("id").isUUID().withMessage("Invalid car ID format"),
  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number"),
  handleValidationErrors,
];

const validateCarStatus = [
  body("id").isUUID().withMessage("Invalid car ID format"),
  body("status")
    .isIn(["available", "sold"])
    .withMessage('Status must be either "available" or "sold"'),
  handleValidationErrors,
];
const validateCarId = [
  body("id").isUUID().withMessage("Invalid car ID format"),
  handleValidationErrors,
];
const validateDeleteCar = [
  body("id").isUUID().withMessage("Invalid car ID format"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateCar,
  validateSingleCar,
  validateUpdateCarPrice,
  validateCarStatus,
  validateCarId,
  validateDeleteCar,
};
