const router = require("express").Router();
const {
  validateRegister,
  validateLogin,
  validateResetPassword,
  validateNewPassword,
} = require("../middleware/validation");
const {
  register,
  login,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

const rateLimiter = require("express-rate-limit");

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    msg: "Too many requests created from this IP, please try again later.",
  },
});

router.post("/register", apiLimiter, validateRegister, register);
router.post("/login", apiLimiter, validateLogin, login);
router.post("/forgot-password", validateResetPassword, requestPasswordReset);
router.post("/reset-password", validateNewPassword, resetPassword);

module.exports = router;
