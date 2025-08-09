const { v4: uuidv4 } = require("uuid");

const storage = {
  users: [],
  cars: [],
  orders: [],
  flags: [],
  resetTokens: [],
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

  updateUser: (id, updateData) => {
    const userIndex = storage.users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      storage.users[userIndex] = { ...storage.users[userIndex], ...updateData };
      return storage.users[userIndex];
    }
    return null;
  },

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
    const car = dataOperations.findCarById(id);
    if (car) {
      car.status = status;
      return car;
    }
    return null;
  },
  updateCarPrice: (id, price) => {
    const car = dataOperations.findCarById(id);
    if (car) {
      car.price = price;
      return car;
    }
    return null;
  },
  deleteCar: (id) => {
    const index = storage.cars.findIndex((car) => car.id === id);
    if (index !== -1) {
      // Delete associated orders and flags
      storage.orders = storage.orders.filter((order) => order.car_id !== id);
      storage.flags = storage.flags.filter((flag) => flag.car_id !== id);

      return storage.cars.splice(index, 1)[0];
    }
    return null;
  },

  // Order operations
  createOrder: (orderData) => {
    const order = {
      id: uuidv4(),
      ...orderData,
      status: "pending", // default status
      created_on: new Date().toISOString(),
    };
    storage.orders.push(order);
    return order;
  },

  findOrderById: (id) => storage.orders.find((order) => order.id === id),

  updateOrderPrice: (id, newPrice) => {
    const order = dataOperations.findOrderById(id);
    if (order) {
      order.amount = newPrice;
      return order;
    }
    return null;
  },
  // if user has already ordered this car
  hasUserOrderedCar: (carId, userId) =>
    storage.orders.some(
      (order) => order.car_id === carId && order.buyer === userId
    ),

  findOrderByCar: (carId, buyerId) =>
    storage.orders.find(
      (order) => order.car_id === carId && order.buyer === buyerId
    ),

  // Flag operations
  createFlag: (flagData) => {
    const flag = {
      id: uuidv4(),
      ...flagData,
      created_on: new Date().toISOString(),
    };
    storage.flags.push(flag);
    return flag;
  },

  findFlagById: (id) => storage.flags.find((flag) => flag.id === id),

  // if user has already flagged this car
  hasUserFlaggedCar: (carId, userId) =>
    storage.flags.some(
      (flag) => flag.car_id === carId && flag.reporter === userId
    ),

  // Reset token operations
  createResetToken: (id, email, token) => {
    const resetToken = {
      id,
      email,
      token,
      created_on: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    };
    storage.resetTokens.push(resetToken);
    return resetToken;
  },

  verifyResetToken: (email, token) => {
    return storage.resetTokens.find(
      (reset) => reset.email === email && reset.token === token
    );
  },

  deleteResetToken: (token) => {
    const index = storage.resetTokens.findIndex(
      (reset) => reset.token === token
    );
    if (index !== -1) {
      return storage.resetTokens.splice(index, 1)[0];
    }
    return null;
  },

  // Cleanup expired tokens
  cleanupExpiredTokens: () => {
    const now = new Date().toISOString();
    storage.resetTokens = storage.resetTokens.filter((t) => t.expires_at > now);
  },
};

module.exports = {
  dataOperations,
  storage, // Export storage for testing purposes
};
