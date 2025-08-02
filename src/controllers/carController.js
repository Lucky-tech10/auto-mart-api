const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { dataOperations } = require("../data/store");
const cloudinary = require("../config/cloudinary");
const checkPermissions = require("../utils/checkPermission");

const createCar = async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    throw new CustomError.BadRequestError("Please upload at least one image");
  }

  if (files.length > 5) {
    throw new CustomError.BadRequestError("You can only upload up to 5 images");
  }

  const urls = [];

  // Upload images to Cloudinary
  const streamUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "file-upload",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      // Pipe the file buffer into the stream
      stream.end(fileBuffer);
    });
  };

  const uploadPromises = files.map((file) => streamUpload(file.buffer));

  try {
    const results = await Promise.all(uploadPromises);
    results.forEach((result) => {
      urls.push(result.secure_url);
    });
  } catch (error) {
    throw new CustomError.BadRequestError(
      "Image upload failed" + error.message
    );
  }

  const newCar = await dataOperations.createCar({
    owner: req.user.id,
    ...req.body,
    images: urls,
    mainPhotoIndex: parseInt(req.body.mainPhotoIndex) || 0, // Default to 0 if not provided
  });

  res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    data: {
      email: req.user.email,
      ...newCar,
    },
  });
};

const getAvailableCars = (req, res) => {
  // Filter available cars

  let filteredCars = dataOperations.findCarsByStatus("available");

  if (filteredCars.length === 0) {
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "No available cars found",
      data: [],
    });
  }

  // Filter by state
  if (req.query.state) {
    filteredCars = filteredCars.filter((car) => car.state === req.query.state);
  }

  // Filter by manufacturer
  if (req.query.make) {
    filteredCars = filteredCars.filter(
      (car) => car.make.toLowerCase() === req.query.make.toLowerCase()
    );
  }

  // Filter by body type
  if (req.query.body_type) {
    filteredCars = filteredCars.filter(
      (car) => car.body_type === req.query.body_type
    );
  }

  // Filter by price range
  const minPrice = parseFloat(req.query.min_price);
  const maxPrice = parseFloat(req.query.max_price);

  if (!isNaN(minPrice)) {
    filteredCars = filteredCars.filter((car) => car.price >= minPrice);
  }

  if (!isNaN(maxPrice)) {
    filteredCars = filteredCars.filter((car) => car.price <= maxPrice);
  }

  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const totalCars = filteredCars.length;
  const totalPages = Math.ceil(totalCars / limit);

  // Get total number of available cars
  const totalAvailableCars =
    dataOperations.findCarsByStatus("available").length;

  const paginatedCars = filteredCars.slice((page - 1) * limit, page * limit);

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    page,
    limit,
    totalPages,
    totalCars, // total number of cars after filtering
    totalAvailableCars, // total number of available cars
    data: paginatedCars,
  });
};

const getAdminCars = (req, res) => {
  const cars = dataOperations.getAllCars();
  if (cars.length === 0) {
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "No cars available",
      data: [],
    });
  }

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    data: cars,
  });
};

const getSingleUserCars = (req, res) => {
  const userId = req.user.id;
  const cars = dataOperations.findCarsByOwner(userId);

  if (cars.length === 0) {
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "No cars found for this user",
      data: [],
    });
  }

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    data: cars,
  });
};

const getSingleCar = (req, res) => {
  const carId = req.params.id;
  const car = dataOperations.findCarById(carId);
  if (!car) {
    throw new CustomError.NotFoundError("Car not found");
  }
  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    data: car,
  });
};

const updateCarStatus = (req, res) => {
  const carId = req.params.id;
  const { status } = req.body;

  if (!status) {
    throw new CustomError.BadRequestError("Please provide a status");
  }

  const car = dataOperations.findCarById(carId);
  if (!car) {
    throw new CustomError.NotFoundError("Car not found");
  }

  // Check permissions
  checkPermissions(req.user, car.owner);

  const updatedCar = dataOperations.updateCarStatus(carId, status);

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    data: updatedCar,
  });
};

const updateCarPrice = (req, res) => {
  const carId = req.params.id;
  const { price } = req.body;

  if (!price) {
    throw new CustomError.BadRequestError("Please provide a price");
  }

  const car = dataOperations.findCarById(carId);
  if (!car) {
    throw new CustomError.NotFoundError("Car not found");
  }

  // Check permissions
  checkPermissions(req.user, car.owner);

  const updatedCar = dataOperations.updateCarPrice(carId, price);

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    data: updatedCar,
  });
};

const deleteCar = (req, res) => {
  const carId = req.params.id;

  const deletedCar = dataOperations.deleteCar(carId);
  if (!deletedCar) {
    throw new CustomError.NotFoundError("Car not found");
  }

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    message: "Car deleted successfully",
  });
};

module.exports = {
  createCar,
  getAvailableCars,
  getAdminCars,
  getSingleUserCars,
  getSingleCar,
  updateCarStatus,
  updateCarPrice,
  deleteCar,
};
