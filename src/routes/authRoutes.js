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

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/forgot-password", validateResetPassword, requestPasswordReset);
router.post("/reset-password", validateNewPassword, resetPassword);

module.exports = router;
