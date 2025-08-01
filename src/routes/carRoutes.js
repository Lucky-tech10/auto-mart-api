const router = require("express").Router();
const {
  validateCreateCar,
  validateSingleCar,
  validateUpdateCarPrice,
  validateCarStatus,
  validateCarId,
  validateDeleteCar,
} = require("../middleware/validation");
const upload = require("../middleware/upload");
const { authMiddleware } = require("../middleware/auth");
const {
  createCar,
  getAllCars,
  getSingleCar,
  updateCarStatus,
  updateCarPrice,
  deleteCar,
} = require("../controllers/carController");

router
  .route("/")
  .post(authMiddleware, upload.array("images", 5), validateCreateCar, createCar)
  .get(getAllCars);
router.route("/:id").get(getSingleCar).delete(authMiddleware, deleteCar);
router.route("/:id/status").patch(authMiddleware, updateCarStatus);
router.route("/:id/price").patch(authMiddleware, updateCarPrice);

module.exports = router;
