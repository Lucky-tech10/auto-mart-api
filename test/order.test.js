const request = require("supertest");
const { app, server } = require("../server");
const jwt = require("jsonwebtoken");
const { dataOperations } = require("../src/data/store");

describe("Order Routes", () => {
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

  describe("POST /api/v1/order", () => {
    it("should create an order successfully", async () => {
      const orderData = {
        car_id: testData.car1.id,
        amount: 24000,
      };

      const response = await request(app)
        .post("/api/v1/order")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.status).toBe(201);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.car_id).toBe(orderData.car_id);
      expect(response.body.data.amount).toBe(orderData.amount);
      expect(response.body.data.buyer).toBe(testData.secondUser.id);
      expect(response.body.data.status).toBe("pending");
      expect(response.body.data).toHaveProperty("created_on");
    });

    it("should return 401 for unauthenticated user", async () => {
      const orderData = {
        car_id: testData.car1.id,
        amount: 24000,
      };

      const response = await request(app)
        .post("/api/v1/order")
        .send(orderData)
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });

    it("should return 404 for non-existent car", async () => {
      const fakeCarId = "550e8400-e29b-41d4-a716-446655440000";
      const orderData = {
        car_id: fakeCarId,
        amount: 24000,
      };

      const response = await request(app)
        .post("/api/v1/order")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(orderData)
        .expect(404);

      expect(response.body.msg).toBe("Car not found or not available");
    });

    it("should return 404 for unavailable car (sold car)", async () => {
      const orderData = {
        car_id: testData.car3.id, // This car is sold
        amount: 44000,
      };

      const response = await request(app)
        .post("/api/v1/order")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData)
        .expect(404);

      expect(response.body.msg).toBe("Car not found or not available");
    });

    it("should return 400 when user tries to order their own car", async () => {
      const orderData = {
        car_id: testData.car1.id, // This car belongs to regularUser
        amount: 24000,
      };

      const response = await request(app)
        .post("/api/v1/order")
        .set("Authorization", `Bearer ${userToken}`) // regularUser trying to order their own car
        .send(orderData)
        .expect(400);

      expect(response.body.msg).toBe("You cannot order your own car");
    });

    it("should return 400 for invalid car_id format", async () => {
      const orderData = {
        car_id: "invalid-uuid",
        amount: 24000,
      };

      const response = await request(app)
        .post("/api/v1/order")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for invalid amount", async () => {
      const orderData = {
        car_id: testData.car1.id,
        amount: -1000, // Negative amount
      };

      const response = await request(app)
        .post("/api/v1/order")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for zero amount", async () => {
      const orderData = {
        car_id: testData.car1.id,
        amount: 0,
      };

      const response = await request(app)
        .post("/api/v1/order")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for missing car_id", async () => {
      const orderData = {
        amount: 24000,
      };

      const response = await request(app)
        .post("/api/v1/order")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for missing amount", async () => {
      const orderData = {
        car_id: testData.car1.id,
      };

      const response = await request(app)
        .post("/api/v1/order")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for non-numeric amount", async () => {
      const orderData = {
        car_id: testData.car1.id,
        amount: "invalid-amount",
      };

      const response = await request(app)
        .post("/api/v1/order")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("PATCH /api/v1/order/:id/price", () => {
    let testOrder;

    beforeEach(() => {
      // Create a test order
      testOrder = dataOperations.createOrder({
        car_id: testData.car1.id,
        buyer: testData.secondUser.id,
        amount: 24000,
      });
    });

    it("should update order price successfully by order owner", async () => {
      const updateData = {
        new_price: 26000,
      };

      const response = await request(app)
        .patch(`/api/v1/order/${testOrder.id}/price`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data.amount).toBe(updateData.new_price);
      expect(response.body.data.id).toBe(testOrder.id);
    });

    it("should return 401 for unauthenticated user", async () => {
      const updateData = {
        new_price: 26000,
      };

      const response = await request(app)
        .patch(`/api/v1/order/${testOrder.id}/price`)
        .send(updateData)
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });

    it("should return 404 for non-existent order", async () => {
      const fakeOrderId = "550e8400-e29b-41d4-a716-446655440000";
      const updateData = {
        new_price: 26000,
      };

      const response = await request(app)
        .patch(`/api/v1/order/${fakeOrderId}/price`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.msg).toBe("Order not found");
    });

    it("should return 403 for non-owner user", async () => {
      const updateData = {
        new_price: 26000,
      };

      const response = await request(app)
        .patch(`/api/v1/order/${testOrder.id}/price`)
        .set("Authorization", `Bearer ${userToken}`) // Different user
        .send(updateData)
        .expect(403);

      expect(response.body.msg).toBe("Not authorized to access this resource");
    });

    it("should return 400 for invalid order ID format", async () => {
      const updateData = {
        new_price: 26000,
      };

      const response = await request(app)
        .patch("/api/v1/order/invalid-uuid/price")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for invalid new_price", async () => {
      const updateData = {
        new_price: -1000, // Negative price
      };

      const response = await request(app)
        .patch(`/api/v1/order/${testOrder.id}/price`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for zero new_price", async () => {
      const updateData = {
        new_price: 0,
      };

      const response = await request(app)
        .patch(`/api/v1/order/${testOrder.id}/price`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for missing new_price", async () => {
      const response = await request(app)
        .patch(`/api/v1/order/${testOrder.id}/price`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for non-numeric new_price", async () => {
      const updateData = {
        new_price: "invalid-price",
      };

      const response = await request(app)
        .patch(`/api/v1/order/${testOrder.id}/price`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for non-pending order", async () => {
      // Update order status to non-pending
      testOrder.status = "accepted";

      const updateData = {
        new_price: 26000,
      };

      const response = await request(app)
        .patch(`/api/v1/order/${testOrder.id}/price`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.msg).toBe("Only pending orders can be updated");
    });

    it("should return 404 when associated car is not available", async () => {
      // Make the car unavailable
      dataOperations.updateCarStatus(testData.car1.id, "sold");

      const updateData = {
        new_price: 26000,
      };

      const response = await request(app)
        .patch(`/api/v1/order/${testOrder.id}/price`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.msg).toBe("Car not found or not available");
    });
  });
});
