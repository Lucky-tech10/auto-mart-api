const { v4: uuidv4 } = require("uuid");

const storage = {
  users: [
    {
      id: "978c6f31-1302-4954-885d-039ca938c293",
      email: "ezihegoodluck59@gmail.com",
      first_name: "dragon",
      last_name: "panther",
      password: "$2b$10$wdy1jjpB.kKbyf02wYe7eOoQ9j08fWdVEA1gbClsyIYqunCJsbvSa",
      address: "world bank",
      role: "admin",
      created_on: "2025-09-09T08:48:48.327Z",
    },
    {
      id: "fefcaa9b-9652-4412-b1df-f444085a4720",
      email: "chidex502@gmail.com",
      first_name: "Treble",
      last_name: "Iceberg",
      password: "$2b$10$mURZVecyvhMcL5KuOn873.HyY6jjVtBTSIN98jvLaHLE6.M.6aJ7a",
      address: "world bank",
      role: "user",
      created_on: "2025-09-09T08:53:18.562Z",
    },
  ],
  cars: [
    {
      email: "chidex502@gmail.com",
      id: "0f2d1045-efd8-40c9-a569-a8fbfa0b22c4",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "ford",
      model: "explorer",
      price: 45000000,
      state: "used",
      status: "available",
      description: "best in the market right now",
      location: "Turkey",
      body_type: "sedan",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757408440/file-upload/r3icwwzawb17rbgz5uul.png",
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757408440/file-upload/j5zkxrxidfcejufawgty.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T09:00:40.676Z",
    },
    {
      email: "chidex502@gmail.com",
      id: "0f2d1045-efd8-40c9-a569-a8fbfa0b22c7",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "toyota",
      model: "camry",
      price: 25000000,
      state: "new",
      status: "available",
      description: "best in the state right now",
      location: "korea",
      body_type: "convertible",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757408440/file-upload/j5zkxrxidfcejufawgty.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T09:07:40.676Z",
    },
    {
      email: "chidex502@gmail.com",
      id: "27249609-4c98-4833-bebd-8ae1cfa64e5e",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "nissan",
      model: "x-terran",
      price: 5000000,
      state: "used",
      status: "available",
      description: "best in the world atm",
      location: "japan",
      body_type: "suv",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757409005/file-upload/ybahsm4cepfhg5150l0k.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T09:10:05.675Z",
    },
    {
      email: "ezihegoodluck59@gmail.com",
      id: "a2e8004b-5236-4352-a631-159760b2faa7",
      owner: "978c6f31-1302-4954-885d-039ca938c293",
      make: "audi",
      model: "A3",
      price: 9000000,
      state: "new",
      status: "available",
      description: "best in the country now",
      location: "china",
      body_type: "coupe",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757409469/file-upload/fvf1yi9qoihv7458miho.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T09:17:48.966Z",
    },
    {
      email: "chidex502@gmail.com",
      id: "0f2d1045-efd8-40c9-a569-a8fbfa0b22c3",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "bmw",
      model: "x6",
      price: 60000000,
      state: "used",
      status: "available",
      description: "best in the market right now",
      location: "usa",
      body_type: "minivan",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757431473/file-upload/xoohmjbd2x9lhipkrmfd.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T09:20:40.676Z",
    },
    {
      email: "chidex502@gmail.com",
      id: "0f2d1045-efd8-40c9-a569-a8fbfa0b22c6",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "honda",
      model: "crosstour",
      price: 25000000,
      state: "used",
      status: "available",
      description: "best in the state right now",
      location: "france",
      body_type: "pickup",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757431472/file-upload/fh5lxzqpoz1suxsuirjy.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T09:22:40.676Z",
    },
    {
      email: "chidex502@gmail.com",
      id: "27249609-4c98-4833-bebd-8ae1cfa64e5c",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "mercedes",
      model: "GLE",
      price: 53000000,
      state: "new",
      status: "available",
      description: "best in the world atm",
      location: "thailand",
      body_type: "wagon",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757431472/file-upload/iw2tmc4htw1xuhmblsly.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T09:24:05.675Z",
    },
    {
      email: "ezihegoodluck59@gmail.com",
      id: "a2e8004b-5236-4352-a631-159760b2faa9",
      owner: "978c6f31-1302-4954-885d-039ca938c293",
      make: "hyundai",
      model: "truck",
      price: 3000000,
      state: "new",
      status: "available",
      description: "best in the country now",
      location: "togo",
      body_type: "hatchback",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757431472/file-upload/sonboapdeehdotiedfdc.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T09:27:48.966Z",
    },
    {
      email: "chidex502@gmail.com",
      id: "0f2d1045-efd8-40c9-a569-a8fbfa0b22c1",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "ford",
      model: "explorer",
      price: 45000000,
      state: "used",
      status: "available",
      description: "best in the market right now",
      location: "Turkey",
      body_type: "sedan",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757408440/file-upload/r3icwwzawb17rbgz5uul.png",
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757408440/file-upload/j5zkxrxidfcejufawgty.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T10:00:40.676Z",
    },
    {
      email: "chidex502@gmail.com",
      id: "0f2d1045-efd8-40c9-a569-a8fbfa0b22c2",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "toyota",
      model: "camry",
      price: 25000000,
      state: "new",
      status: "available",
      description: "best in the state right now",
      location: "korea",
      body_type: "convertible",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757408440/file-upload/j5zkxrxidfcejufawgty.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T10:07:40.676Z",
    },
    {
      email: "chidex502@gmail.com",
      id: "27249609-4c98-4833-bebd-8ae1cfa64e5f",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "nissan",
      model: "x-terran",
      price: 5000000,
      state: "used",
      status: "available",
      description: "best in the world atm",
      location: "japan",
      body_type: "suv",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757409005/file-upload/ybahsm4cepfhg5150l0k.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T10:10:05.675Z",
    },
    {
      email: "ezihegoodluck59@gmail.com",
      id: "a2e8004b-5236-4352-a631-159760b2faa8",
      owner: "978c6f31-1302-4954-885d-039ca938c293",
      make: "audi",
      model: "A3",
      price: 9000000,
      state: "new",
      status: "available",
      description: "best in the country now",
      location: "china",
      body_type: "coupe",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757409469/file-upload/fvf1yi9qoihv7458miho.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T10:17:48.966Z",
    },
    {
      email: "chidex502@gmail.com",
      id: "0f2d1045-efd8-40c9-a569-a8fbfa0b22c5",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "bmw",
      model: "x6",
      price: 60000000,
      state: "used",
      status: "available",
      description: "best in the market right now",
      location: "usa",
      body_type: "minivan",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757431473/file-upload/xoohmjbd2x9lhipkrmfd.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T10:20:40.676Z",
    },
    {
      email: "chidex502@gmail.com",
      id: "0f2d1045-efd8-40c9-a569-a8fbfa0b22c9",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "honda",
      model: "crosstour",
      price: 25000000,
      state: "used",
      status: "available",
      description: "best in the state right now",
      location: "france",
      body_type: "pickup",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757431472/file-upload/fh5lxzqpoz1suxsuirjy.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T10:22:40.676Z",
    },
    {
      email: "chidex502@gmail.com",
      id: "27249609-4c98-4833-bebd-8ae1cfa64e5d",
      owner: "fefcaa9b-9652-4412-b1df-f444085a4720",
      make: "mercedes",
      model: "GLE",
      price: 53000000,
      state: "new",
      status: "available",
      description: "best in the world atm",
      location: "thailand",
      body_type: "wagon",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757431472/file-upload/iw2tmc4htw1xuhmblsly.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T10:24:05.675Z",
    },
    {
      email: "ezihegoodluck59@gmail.com",
      id: "a2e8004b-5236-4352-a631-159760b2faa6",
      owner: "978c6f31-1302-4954-885d-039ca938c293",
      make: "hyundai",
      model: "truck",
      price: 3000000,
      state: "new",
      status: "available",
      description: "best in the country now",
      location: "togo",
      body_type: "hatchback",
      images: [
        "https://res.cloudinary.com/dghaekyhv/image/upload/v1757431472/file-upload/sonboapdeehdotiedfdc.png",
      ],
      mainPhotoIndex: 0,
      created_on: "2025-09-09T10:27:48.966Z",
    },
  ],
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
