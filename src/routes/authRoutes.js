const router = require("express").Router();
const { validateRegister, validateLogin } = require("../middleware/validation");
const { register, login } = require("../controllers/authController");

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

module.exports = router;
