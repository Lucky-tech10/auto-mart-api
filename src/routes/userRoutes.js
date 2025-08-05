const router = require("express").Router();
const { validateUpdatePassword } = require("../middleware/validation");
const {
  showCurrentUser,
  updatePassword,
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/auth");

router.get("/showUser", authMiddleware, showCurrentUser);
router.patch(
  "/update-password",
  authMiddleware,
  validateUpdatePassword,
  updatePassword
);

module.exports = router;
