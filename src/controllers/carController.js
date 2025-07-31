const createCar = (req, res) => {
  res.send("Car creation");
};

const getAllCars = (req, res) => {
  res.send("get all cars");
};

const getSingleCar = (req, res) => {
  res.send("get single Car");
};

const updateCarStatus = (req, res) => {
  res.send("status updated");
};

const updateCarPrice = (req, res) => {
  res.send("price updated");
};

const deleteCar = (req, res) => {
  res.send("car deleted");
};

module.exports = {
  createCar,
  getAllCars,
  getSingleCar,
  updateCarStatus,
  updateCarPrice,
  deleteCar,
};
