const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { dataOperations } = require("../data/store");
const cloudinary = require("../config/cloudinary");

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

  const newCar = dataOperations.createCar({
    owner: req.user.id,
    ...req.body,
    images: urls,
    mainPhotoIndex: parseInt(req.body.mainPhotoIndex) || 0, // Default to 0 if not provided
  });

  res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    data: {
      id: newCar.id,
      owner: newCar.owner,
      email: req.user.email,
      make: newCar.make,
      model: newCar.model,
      price: newCar.price,
      state: newCar.state,
      status: newCar.status,
      description: newCar.description,
      location: newCar.location,
      body_type: newCar.body_type,
      images: newCar.images,
      mainPhotoIndex: newCar.mainPhotoIndex,
      created_on: newCar.created_on,
    },
  });
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
