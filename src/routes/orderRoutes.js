const router = require("express").Router();
const {
  validateCreateOrder,
  validateUpdateOrderPrice,
} = require("../middleware/validation");
const { authMiddleware } = require("../middleware/auth");
const {
  createOrder,
  updateOrderPrice,
} = require("../controllers/orderController");

router.route("/").post(authMiddleware, validateCreateOrder, createOrder);
router
  .route("/:id/price")
  .patch(authMiddleware, validateUpdateOrderPrice, updateOrderPrice);

module.exports = router;
