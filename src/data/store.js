const { v4: uuidv4 } = require("uuid");

const storage = {
  users: [],
  cars: [],
};

// Helper functions for data operations
const dataOperations = {
  // first registered user is an admin
  isFirstAccount: () => storage.users.length === 0,

  // User operations
  createUser: (userData) => {
    const newUser = {
      id: uuidv4(),
      ...userData,
      created_on: new Date().toISOString(),
    };
    storage.users.push(newUser);
    return newUser;
  },

  findUserByEmail: (email) =>
    storage.users.find((user) => user.email === email),

  findUserById: (id) => storage.users.find((user) => user.id === id),

  // Car operations
  createCar: (carData) => {
    const car = {
      id: uuidv4(),
      ...carData,
      created_on: new Date().toISOString(),
    };
    storage.cars.push(car);
    return car;
  },

  findCarById: (id) => storage.cars.find((car) => car.id === id),

  findCarsByOwner: (ownerId) =>
    storage.cars.filter((car) => car.owner === ownerId),

  findCarsByStatus: (status) =>
    storage.cars.filter(
      (car) => car.status && car.status.toLowerCase() === status.toLowerCase()
    ),

  getAllCars: () => storage.cars,

  updateCarStatus: (id, status) => {
    const car = storage.findCarById(id);
    if (car) {
      car.status = status;
      return car;
    }
    return null;
  },
  updateCarPrice: (id, price) => {
    const car = storage.findCarById(id);
    if (car) {
      car.price = price;
      return car;
    }
    return null;
  },
  deleteCar: (id) => {
    const index = storage.cars.findIndex((car) => car.id === id);
    if (index !== -1) {
      return storage.cars.splice(index, 1)[0];
    }
    return null;
  },
};

module.exports = {
  dataOperations,
};
