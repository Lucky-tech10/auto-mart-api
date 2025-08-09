const request = require("supertest");
const { app, server } = require("../server");
const jwt = require("jsonwebtoken");

// Mock cloudinary only for car tests since we test image uploads
jest.mock("../src/config/cloudinary", () => ({
  uploader: {
    upload_stream: jest.fn((options, callback) => {
      callback(null, {
        secure_url:
          "https://res.cloudinary.com/test/image/upload/test-image.jpg",
      });
      return {
        end: jest.fn(),
      };
    }),
  },
}));

describe("Car Routes", () => {
  let adminToken, userToken, secondUserToken;
  let testData;

  beforeEach(() => {
    testData = global.getTestData();

    // Generate tokens for test users
    adminToken = jwt.sign(
      {
        id: testData.adminUser.id,
        email: testData.adminUser.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    userToken = jwt.sign(
      {
        id: testData.regularUser.id,
        email: testData.regularUser.email,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    secondUserToken = jwt.sign(
      {
        id: testData.secondUser.id,
        email: testData.secondUser.email,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterAll(() => {
    server.close();
  });

  describe("POST /api/v1/car", () => {
    it("should create a car successfully with valid data and images", async () => {
      // Create a mock image buffer
      const mockImageBuffer = Buffer.from("fake image data");

      const response = await request(app)
        .post("/api/v1/car")
        .set("Authorization", `Bearer ${userToken}`)
        .field("make", "ford")
        .field("model", "Focus")
        .field("price", "20000")
        .field("status", "available")
        .field("state", "used")
        .field("location", "Lagos")
        .field("description", "Great car in excellent condition")
        .field("body_type", "hatchback")
        .field("mainPhotoIndex", "0")
        .attach("images", mockImageBuffer, "test-image.jpg")
        .expect(201);

      expect(response.body.status).toBe(201);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.make).toBe("ford");
      expect(response.body.data.owner).toBe(testData.regularUser.id);
      expect(response.body.data.images).toHaveLength(1);
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app)
        .post("/api/v1/car")
        .field("make", "ford")
        .field("model", "Focus")
        .field("price", "20000")
        .field("status", "available")
        .field("state", "used")
        .field("location", "Lagos")
        .field("body_type", "hatchback")
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });

    it("should return 400 for missing images", async () => {
      const response = await request(app)
        .post("/api/v1/car")
        .set("Authorization", `Bearer ${userToken}`)
        .field("make", "ford")
        .field("model", "Focus")
        .field("price", "20000")
        .field("status", "available")
        .field("state", "used")
        .field("location", "Lagos")
        .field("body_type", "hatchback")
        .expect(400);

      expect(response.body.msg).toBe("Please upload at least one image");
    });

    it("should return 400 for invalid car data", async () => {
      const mockImageBuffer = Buffer.from("fake image data");

      const response = await request(app)
        .post("/api/v1/car")
        .set("Authorization", `Bearer ${userToken}`)
        .field("make", "") // Empty make
        .field("model", "Focus")
        .field("price", "invalid-price")
        .field("status", "available")
        .field("state", "used")
        .field("location", "Lagos")
        .field("body_type", "hatchback")
        .attach("images", mockImageBuffer, "test-image.jpg")
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for more than 5 images", async () => {
      const mockImageBuffer = Buffer.from("fake image data");

      const request_builder = request(app)
        .post("/api/v1/car")
        .set("Authorization", `Bearer ${userToken}`)
        .field("make", "ford")
        .field("model", "Focus")
        .field("price", "20000")
        .field("status", "available")
        .field("state", "used")
        .field("location", "Lagos")
        .field("body_type", "hatchback");

      // Attach 6 images
      for (let i = 0; i < 6; i++) {
        request_builder.attach(
          "images",
          mockImageBuffer,
          `test-image-${i}.jpg`
        );
      }

      const response = await request_builder.expect(400);
      expect(response.body.msg).toBe("You can only upload up to 5 images.");
    });
  });

  describe("GET /api/v1/car", () => {
    it("should get all available cars", async () => {
      const response = await request(app).get("/api/v1/car").expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2); // Only available cars (car1 and car2)
      expect(response.body).toHaveProperty("totalAvailableCars", 2);
      expect(response.body).toHaveProperty("page", 1);
      expect(response.body).toHaveProperty("limit", 12);
    });

    it("should filter cars by state", async () => {
      const response = await request(app)
        .get("/api/v1/car?state=new")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].state).toBe("new");
    });

    it("should filter cars by make", async () => {
      const response = await request(app)
        .get("/api/v1/car?make=toyota")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].make).toBe("toyota");
    });

    it("should filter cars by body type", async () => {
      const response = await request(app)
        .get("/api/v1/car?body_type=sedan")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach((car) => {
        expect(car.body_type).toBe("sedan");
      });
    });

    it("should filter cars by price range", async () => {
      const response = await request(app)
        .get("/api/v1/car?min_price=20000&max_price=30000")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach((car) => {
        expect(car.price).toBeGreaterThanOrEqual(20000);
        expect(car.price).toBeLessThanOrEqual(30000);
      });
    });

    it("should handle pagination", async () => {
      const response = await request(app)
        .get("/api/v1/car?page=1&limit=1")
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
      expect(response.body.totalPages).toBe(2);
    });

    it("should return 400 for invalid query parameters", async () => {
      const response = await request(app)
        .get("/api/v1/car?state=invalid")
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("GET /api/v1/car/user", () => {
    it("should get current user cars", async () => {
      const response = await request(app)
        .get("/api/v1/car/user")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data).toHaveLength(2); // regularUser owns car1 and car2
      response.body.data.forEach((car) => {
        expect(car.owner).toBe(testData.regularUser.id);
      });
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app).get("/api/v1/car/user").expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });

    it("should return empty array for user with no cars", async () => {
      const response = await request(app)
        .get("/api/v1/car/user")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.message).toBe("No cars found for this user");
    });
  });

  describe("GET /api/v1/car/admin", () => {
    it("should get all cars for admin", async () => {
      const response = await request(app)
        .get("/api/v1/car/admin")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data).toHaveLength(3); // All cars including sold ones
    });

    it("should return 403 for non-admin user", async () => {
      const response = await request(app)
        .get("/api/v1/car/admin")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.msg).toBe("Unauthorized to access this route");
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app).get("/api/v1/car/admin").expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });
  });

  describe("GET /api/v1/car/:id", () => {
    it("should get single car by ID", async () => {
      const response = await request(app)
        .get(`/api/v1/car/${testData.car1.id}`)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data.id).toBe(testData.car1.id);
      expect(response.body.data.make).toBe("toyota");
    });

    it("should return 404 for non-existent car", async () => {
      const fakeId = "550e8400-e29b-41d4-a716-446655440000";
      const response = await request(app)
        .get(`/api/v1/car/${fakeId}`)
        .expect(404);

      expect(response.body.msg).toBe("Car not found");
    });

    it("should return 400 for invalid car ID format", async () => {
      const response = await request(app)
        .get("/api/v1/car/invalid-id")
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("GET /api/v1/car/:id/actions", () => {
    it("should get user car actions", async () => {
      const response = await request(app)
        .get(`/api/v1/car/${testData.car1.id}/actions`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data).toHaveProperty("hasOrdered");
      expect(response.body.data).toHaveProperty("hasFlagged");
      expect(typeof response.body.data.hasOrdered).toBe("boolean");
      expect(typeof response.body.data.hasFlagged).toBe("boolean");
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app)
        .get(`/api/v1/car/${testData.car1.id}/actions`)
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });
  });

  describe("PATCH /api/v1/car/:id/status", () => {
    it("should update car status by owner", async () => {
      const response = await request(app)
        .patch(`/api/v1/car/${testData.car1.id}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "sold" })
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data.status).toBe("sold");
      expect(response.body.data.id).toBe(testData.car1.id);
    });

    it("should return 403 for non-owner user", async () => {
      const response = await request(app)
        .patch(`/api/v1/car/${testData.car1.id}/status`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send({ status: "sold" })
        .expect(403);

      expect(response.body.msg).toBe("Not authorized to access this resource");
    });

    it("should return 400 for invalid status", async () => {
      const response = await request(app)
        .patch(`/api/v1/car/${testData.car1.id}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "invalid-status" })
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for missing status", async () => {
      const response = await request(app)
        .patch(`/api/v1/car/${testData.car1.id}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.msg).toBe(
        'Status must be either "available" or "sold"'
      );
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app)
        .patch(`/api/v1/car/${testData.car1.id}/status`)
        .send({ status: "sold" })
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });
  });

  describe("PATCH /api/v1/car/:id/price", () => {
    it("should update car price by owner", async () => {
      const newPrice = 27000;
      const response = await request(app)
        .patch(`/api/v1/car/${testData.car1.id}/price`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ price: newPrice })
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data.price).toBe(newPrice);
      expect(response.body.data.id).toBe(testData.car1.id);
    });

    it("should return 403 for non-owner user", async () => {
      const response = await request(app)
        .patch(`/api/v1/car/${testData.car1.id}/price`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send({ price: 30000 })
        .expect(403);

      expect(response.body.msg).toBe("Not authorized to access this resource");
    });

    it("should return 400 for invalid price", async () => {
      const response = await request(app)
        .patch(`/api/v1/car/${testData.car1.id}/price`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ price: -1000 })
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for missing price", async () => {
      const response = await request(app)
        .patch(`/api/v1/car/${testData.car1.id}/price`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.msg).toBe("Price must be a positive number");
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app)
        .patch(`/api/v1/car/${testData.car1.id}/price`)
        .send({ price: 30000 })
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });
  });

  describe("DELETE /api/v1/car/:id", () => {
    it("should delete car by admin", async () => {
      const response = await request(app)
        .delete(`/api/v1/car/${testData.car1.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.message).toBe("Car deleted successfully");
    });

    it("should return 403 for non-admin user", async () => {
      const response = await request(app)
        .delete(`/api/v1/car/${testData.car1.id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.msg).toBe("Unauthorized to access this route");
    });

    it("should return 404 for non-existent car", async () => {
      const fakeId = "550e8400-e29b-41d4-a716-446655440000";
      const response = await request(app)
        .delete(`/api/v1/car/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.msg).toBe("Car not found");
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app)
        .delete(`/api/v1/car/${testData.car1.id}`)
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });

    it("should return 400 for invalid car ID format", async () => {
      const response = await request(app)
        .delete("/api/v1/car/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("GET /api/v1/car/:id/order", () => {
    const { dataOperations, storage } = require("../src/data/store");
    let testOrder;

    beforeEach(() => {
      // Create a test order
      testOrder = dataOperations.createOrder({
        car_id: testData.car1.id,
        buyer: testData.secondUser.id,
        amount: 24000,
      });
    });

    it("should get user order for car successfully", async () => {
      const response = await request(app)
        .get(`/api/v1/car/${testData.car1.id}/order`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        status: 200,
        data: {
          id: testOrder.id,
          car_id: testData.car1.id,
          buyer: testData.secondUser.id,
          amount: 24000,
          status: "pending",
        },
      });
    });

    it("should return 404 when user has no order for the car", async () => {
      const response = await request(app)
        .get(`/api/v1/car/${testData.car1.id}/order`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.msg).toBe("Order not found for this Car");
    });

    it("should not return other users orders", async () => {
      // Create order for different user on same car
      const differentUser = { id: "2d099819-aa15-4957-8aa2-c3aa0e505581" };
      const otherUserOrder = {
        id: "2d099819-aa15-4957-8cc2-c3aa0e505581",
        car_id: testData.car1.id,
        buyer: differentUser.id,
        amount: 22000000,
        status: "pending",
      };
      storage.orders.push(otherUserOrder);

      const response = await request(app)
        .get(`/api/v1/car/${testData.car1.id}/order`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .expect(200);

      // Should return current user's order, not the other user's order
      expect(response.body.data.buyer).toBe(testData.secondUser.id);
      expect(response.body.data.id).toBe(testOrder.id);
      expect(response.body.data.amount).toBe(24000); // Current user's amount
    });
  });
});
