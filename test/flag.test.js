const request = require("supertest");
const { app, server } = require("../server");
const jwt = require("jsonwebtoken");
const { dataOperations } = require("../src/data/store");

describe("Flag Routes", () => {
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

  describe("POST /api/v1/flag", () => {
    it("should create a flag successfully", async () => {
      const flagData = {
        car_id: testData.car1.id,
        reason: "Suspicious pricing",
        description: "The price seems too good to be true for this car model",
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(201);

      expect(response.body.status).toBe(201);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.car_id).toBe(flagData.car_id);
      expect(response.body.data.reason).toBe(flagData.reason);
      expect(response.body.data.description).toBe(flagData.description);
      expect(response.body.data.reporter).toBe(testData.secondUser.id);
      expect(response.body.data).toHaveProperty("created_on");
    });

    it("should create a flag without description", async () => {
      const flagData = {
        car_id: testData.car1.id,
        reason: "Inappropriate content",
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(201);

      expect(response.body.status).toBe(201);
      expect(response.body.data.car_id).toBe(flagData.car_id);
      expect(response.body.data.reason).toBe(flagData.reason);
      expect(response.body.data.reporter).toBe(testData.secondUser.id);
    });

    it("should return 401 for unauthenticated user", async () => {
      const flagData = {
        car_id: testData.car1.id,
        reason: "Suspicious pricing",
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .send(flagData)
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });

    it("should return 404 for non-existent car", async () => {
      const fakeCarId = "550e8400-e29b-41d4-a716-446655440000";
      const flagData = {
        car_id: fakeCarId,
        reason: "Suspicious pricing",
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(404);

      expect(response.body.msg).toBe("Car not found or not available");
    });

    it("should return 404 for unavailable car (sold car)", async () => {
      const flagData = {
        car_id: testData.car3.id, // This car is sold
        reason: "Suspicious pricing",
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${userToken}`)
        .send(flagData)
        .expect(404);

      expect(response.body.msg).toBe("Car not found or not available");
    });

    it("should return 400 when user tries to flag their own car", async () => {
      const flagData = {
        car_id: testData.car1.id, // This car belongs to regularUser
        reason: "Testing own car flag",
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${userToken}`) // regularUser trying to flag their own car
        .send(flagData)
        .expect(400);

      expect(response.body.msg).toBe("You cannot flag your own car");
    });

    it("should return 400 when user tries to flag the same car twice", async () => {
      // First flag
      const flagData = {
        car_id: testData.car1.id,
        reason: "Suspicious pricing",
      };

      await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(201);

      // Second flag attempt
      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(400);

      expect(response.body.msg).toBe("You have already flagged this car");
    });

    it("should return 400 for invalid car_id format", async () => {
      const flagData = {
        car_id: "invalid-uuid",
        reason: "Suspicious pricing",
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for missing car_id", async () => {
      const flagData = {
        reason: "Suspicious pricing",
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for missing reason", async () => {
      const flagData = {
        car_id: testData.car1.id,
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for empty reason", async () => {
      const flagData = {
        car_id: testData.car1.id,
        reason: "",
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for description that exceeds character limit", async () => {
      const flagData = {
        car_id: testData.car1.id,
        reason: "Suspicious pricing",
        description: "a".repeat(201), // Exceeds 200 character limit
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should trim whitespace from reason and description", async () => {
      const flagData = {
        car_id: testData.car1.id,
        reason: "  Suspicious pricing  ",
        description: "  The price seems too good to be true  ",
      };

      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(201);

      expect(response.body.status).toBe(201);
      expect(response.body.data.reason).toBe("Suspicious pricing");
      expect(response.body.data.description).toBe(
        "The price seems too good to be true"
      );
    });

    it("should allow multiple users to flag the same car", async () => {
      const flagData = {
        car_id: testData.car1.id,
        reason: "Suspicious pricing",
      };

      // First user flags the car
      await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(flagData)
        .expect(201);

      // Admin user flags the same car
      const response = await request(app)
        .post("/api/v1/flag")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(flagData)
        .expect(201);

      expect(response.body.status).toBe(201);
      expect(response.body.data.reporter).toBe(testData.adminUser.id);
    });
  });
});
