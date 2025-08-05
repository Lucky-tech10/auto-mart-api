const router = require("express").Router();
const { validateCreateflag } = require("../middleware/validation");
const { authMiddleware } = require("../middleware/auth");
const createFlag = require("../controllers/flagContoller");

router.route("/").post(authMiddleware, validateCreateflag, createFlag);

module.exports = router;
