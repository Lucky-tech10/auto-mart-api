const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { dataOperations } = require("../data/store");
const checkPermissions = require("../utils/checkPermission");

const createOrder = (req, res) => {
  const { car_id, amount } = req.body;
  const userId = req.user.id;

  // Validate car existence and availability
  const car = dataOperations.findCarById(car_id);
  if (!car || car.status !== "available") {
    throw new CustomError.NotFoundError("Car not found or not available");
  }

  if (car.owner === userId) {
    throw new CustomError.BadRequestError("You cannot order your own car");
  }

  // Create order
  const newOrder = dataOperations.createOrder({
    car_id,
    buyer: userId,
    amount,
  });

  res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    data: newOrder,
  });
};

const updateOrderPrice = (req, res) => {
  const { id: orderId } = req.params;
  const { new_price } = req.body;

  // Validate order existence
  const order = dataOperations.findOrderById(orderId);
  if (!order) {
    throw new CustomError.NotFoundError("Order not found");
  }

  if (order.status !== "pending") {
    throw new CustomError.BadRequestError("Only pending orders can be updated");
  }

  const car = dataOperations.findCarById(order.car_id);
  if (!car || car.status !== "available") {
    throw new CustomError.NotFoundError("Car not found or not available");
  }

  // Check permissions
  checkPermissions(req.user, order.buyer);

  // Update order price
  const updatedOrder = dataOperations.updateOrderPrice(orderId, new_price);

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    data: updatedOrder,
  });
};

module.exports = {
  createOrder,
  updateOrderPrice,
};
