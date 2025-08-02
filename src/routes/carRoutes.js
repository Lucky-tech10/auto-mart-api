const router = require("express").Router();
const {
  validateCreateCar,
  validateCarQuery,
  validateSingleCar,
  validateUpdateCarPrice,
  validateCarStatus,
  validateDeleteCar,
} = require("../middleware/validation");
const upload = require("../middleware/upload");
const { authMiddleware, authorizePermissions } = require("../middleware/auth");
const {
  createCar,
  getAvailableCars,
  getAdminCars,
  getSingleUserCars,
  getSingleCar,
  updateCarStatus,
  updateCarPrice,
  deleteCar,
} = require("../controllers/carController");

router
  .route("/")
  .post(authMiddleware, upload.array("images", 5), validateCreateCar, createCar)
  .get(validateCarQuery, getAvailableCars);
router.route("/user").get(authMiddleware, getSingleUserCars);
router
  .route("/admin")
  .get(authMiddleware, authorizePermissions("admin"), getAdminCars);
router
  .route("/:id")
  .get(validateSingleCar, getSingleCar)
  .delete(
    authMiddleware,
    authorizePermissions("admin"),
    validateDeleteCar,
    deleteCar
  );
router
  .route("/:id/status")
  .patch(authMiddleware, validateCarStatus, updateCarStatus);

router
  .route("/:id/price")
  .patch(authMiddleware, validateUpdateCarPrice, updateCarPrice);

module.exports = router;
