const { body, param, validationResult, query } = require("express-validator");

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

const validateCarQuery = [
  query("state")
    .optional()
    .isIn(["new", "used"])
    .withMessage('State must be either "new" or "used"'),
  query("min_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min price must be a non-negative number"),
  query("max_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max price must be a non-negative number"),
  query("make")
    .optional()
    .isIn([
      "toyota",
      "honda",
      "ford",
      "chevrolet",
      "bmw",
      "mercedes",
      "audi",
      "lexus",
      "nissan",
      "hyundai",
    ])
    .withMessage("Invalid car make"),
  query("body_type")
    .optional()
    .trim()
    .isIn([
      "sedan",
      "suv",
      "hatchback",
      "coupe",
      "convertible",
      "wagon",
      "pickup",
      "minivan",
    ])
    .withMessage("Invalid body type"),
  handleValidationErrors,
];

const validateSingleCar = [
  param("id").isUUID().withMessage("Invalid car ID format"),
  handleValidationErrors,
];

const validateUpdateCarPrice = [
  param("id").isUUID().withMessage("Invalid car ID format"),
  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number"),
  handleValidationErrors,
];

const validateCarStatus = [
  param("id").isUUID().withMessage("Invalid car ID format"),
  body("status")
    .isIn(["available", "sold"])
    .withMessage('Status must be either "available" or "sold"'),
  handleValidationErrors,
];

const validateDeleteCar = [
  param("id").isUUID().withMessage("Invalid car ID format"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateCar,
  validateCarQuery,
  validateSingleCar,
  validateUpdateCarPrice,
  validateCarStatus,
  validateDeleteCar,
};
