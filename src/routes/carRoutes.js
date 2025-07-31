const router = require("express").Router();
// const {} = require("../middleware/validation");
const { authMiddleware } = require("../middleware/auth");
const {
  createCar,
  getAllCars,
  getSingleCar,
  updateCarStatus,
  updateCarPrice,
  deleteCar,
} = require("../controllers/carController");

router.route("/").post(authMiddleware, createCar).get(getAllCars);
router.route("/:id").get(getSingleCar).delete(authMiddleware, deleteCar);
router.route("/:id/status").patch(authMiddleware, updateCarStatus);
router.route("/:id/price").patch(authMiddleware, updateCarPrice);

module.exports = router;
