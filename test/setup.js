const { dataOperations } = require("../src/data/store");
const bcrypt = require("bcryptjs");

// Mock environment variables
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.JWT_LIFETIME = "1h";

// Function to seed test data
const seedTestData = async () => {
  // Clear existing data
  const store = require("../src/data/store");
  Object.assign(store.storage, {
    users: [],
    cars: [],
    orders: [],
    flags: [],
    resetTokens: [],
  });

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create test users
  const adminUser = dataOperations.createUser({
    email: "admin@test.com",
    first_name: "Admin",
    last_name: "User",
    password: hashedPassword,
    address: "123 Admin Street",
    role: "admin",
  });

  const regularUser = dataOperations.createUser({
    email: "user@test.com",
    first_name: "Regular",
    last_name: "User",
    password: hashedPassword,
    address: "456 User Avenue",
    role: "user",
  });

  const secondUser = dataOperations.createUser({
    email: "user2@test.com",
    first_name: "Second",
    last_name: "User",
    password: hashedPassword,
    address: "789 Second Street",
    role: "user",
  });

  // Create test cars
  const car1 = dataOperations.createCar({
    owner: regularUser.id,
    make: "toyota",
    model: "Camry",
    price: 25000,
    status: "available",
    state: "used",
    location: "Lagos",
    description: "Well maintained Toyota Camry",
    body_type: "sedan",
    images: [
      "https://example.com/car1-1.jpg",
      "https://example.com/car1-2.jpg",
    ],
    mainPhotoIndex: 0,
  });

  const car2 = dataOperations.createCar({
    owner: regularUser.id,
    make: "honda",
    model: "Civic",
    price: 22000,
    status: "available",
    state: "new",
    location: "Abuja",
    description: "Brand new Honda Civic",
    body_type: "sedan",
    images: ["https://example.com/car2-1.jpg"],
    mainPhotoIndex: 0,
  });

  const car3 = dataOperations.createCar({
    owner: secondUser.id,
    make: "bmw",
    model: "X5",
    price: 45000,
    status: "sold",
    state: "used",
    location: "Port Harcourt",
    description: "Luxury BMW X5",
    body_type: "suv",
    images: [
      "https://example.com/car3-1.jpg",
      "https://example.com/car3-2.jpg",
      "https://example.com/car3-3.jpg",
    ],
    mainPhotoIndex: 1,
  });

  return {
    adminUser,
    regularUser,
    secondUser,
    car1,
    car2,
    car3,
  };
};

// Global test data
let testData = {};

beforeEach(async () => {
  testData = await seedTestData();
});

// Export for use in tests
global.seedTestData = seedTestData;
global.getTestData = () => testData;
