const router = require("express").Router();
const { validateCreateflag } = require("../middleware/validation");
const { authMiddleware } = require("../middleware/auth");
const createFlag = require("../controllers/flagController");

router.route("/").post(authMiddleware, validateCreateflag, createFlag);

module.exports = router;
