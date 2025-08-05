const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { dataOperations } = require("../data/store");

const createFlag = (req, res) => {
  const { car_id, reason, description } = req.body;
  const userId = req.user.id;

  // Validate car existence
  const car = dataOperations.findCarById(car_id);
  if (!car || car.status !== "available") {
    throw new CustomError.NotFoundError("Car not found or not available");
  }

  if (car.owner === userId) {
    throw new CustomError.BadRequestError("You cannot flag your own car");
  }

  // Check if the user has already flagged this car
  if (dataOperations.hasUserFlaggedCar(car_id, userId)) {
    throw new CustomError.BadRequestError("You have already flagged this car");
  }

  // Create flag
  const newFlag = dataOperations.createFlag({
    car_id,
    reporter: userId,
    reason,
    description,
  });

  res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    data: newFlag,
  });
};

module.exports = createFlag;
