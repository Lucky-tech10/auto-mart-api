const request = require("supertest");
const { app, server } = require("../server");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

describe("User Routes", () => {
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

  describe("GET /api/v1/user/showUser", () => {
    it("should return current user data for authenticated user", async () => {
      const response = await request(app)
        .get("/api/v1/user/showUser")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.user).toHaveProperty("id", testData.regularUser.id);
      expect(response.body.user).toHaveProperty(
        "email",
        testData.regularUser.email
      );
      expect(response.body.user).toHaveProperty(
        "first_name",
        testData.regularUser.first_name
      );
      expect(response.body.user).toHaveProperty(
        "last_name",
        testData.regularUser.last_name
      );
      expect(response.body.user).toHaveProperty(
        "role",
        testData.regularUser.role
      );
      expect(response.body.user).toHaveProperty(
        "address",
        testData.regularUser.address
      );
      expect(response.body.user).toHaveProperty("created_on");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return admin user data for admin", async () => {
      const response = await request(app)
        .get("/api/v1/user/showUser")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.user).toHaveProperty("id", testData.adminUser.id);
      expect(response.body.user).toHaveProperty(
        "email",
        testData.adminUser.email
      );
      expect(response.body.user).toHaveProperty("role", "admin");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 401 for unauthenticated user", async () => {
      const response = await request(app)
        .get("/api/v1/user/showUser")
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });

    it("should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/user/showUser")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });

    it("should return 401 for malformed authorization header", async () => {
      const response = await request(app)
        .get("/api/v1/user/showUser")
        .set("Authorization", "InvalidFormat token")
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });

    it("should return 401 for missing authorization header", async () => {
      const response = await request(app)
        .get("/api/v1/user/showUser")
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });
  });

  describe("PATCH /api/v1/user/update-password", () => {
    it("should update password successfully with valid data", async () => {
      const passwordData = {
        current_password: "password123",
        new_password: "newpassword123",
        confirm_password: "newpassword123",
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.message).toBe("Password updated successfully");

      // Verify that the password was actually changed by trying to login with new password
      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testData.regularUser.email,
          password: "newpassword123",
        })
        .expect(200);

      expect(loginResponse.body.data).toHaveProperty("token");
    });

    it("should return 401 for unauthenticated user", async () => {
      const passwordData = {
        current_password: "password123",
        new_password: "newpassword123",
        confirm_password: "newpassword123",
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .send(passwordData)
        .expect(401);

      expect(response.body.msg).toBe("Authentication invalid");
    });

    it("should return 400 for missing current_password", async () => {
      const passwordData = {
        new_password: "newpassword123",
        confirm_password: "newpassword123",
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.msg).toBe(
        "Current password must be at least 8 characters long"
      );
    });

    it("should return 400 for missing new_password", async () => {
      const passwordData = {
        current_password: "password123",
        confirm_password: "newpassword123",
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.msg).toBe(
        "New password must be at least 8 characters long"
      );
    });

    it("should return 400 for missing confirm_password", async () => {
      const passwordData = {
        current_password: "password123",
        new_password: "newpassword123",
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.msg).toBe(
        "Confirm password must be at least 8 characters long"
      );
    });

    it("should return 400 when new_password and confirm_password do not match", async () => {
      const passwordData = {
        current_password: "password123",
        new_password: "newpassword123",
        confirm_password: "differentpassword123",
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.msg).toBe(
        "New password and confirmation do not match"
      );
    });

    it("should return 401 for incorrect current_password", async () => {
      const passwordData = {
        current_password: "wrongpassword",
        new_password: "newpassword123",
        confirm_password: "newpassword123",
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordData)
        .expect(401);

      expect(response.body.msg).toBe("Current password is incorrect");
    });

    it("should return 400 for short current_password", async () => {
      const passwordData = {
        current_password: "123", // Too short
        new_password: "newpassword123",
        confirm_password: "newpassword123",
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for short new_password", async () => {
      const passwordData = {
        current_password: "password123",
        new_password: "123", // Too short
        confirm_password: "123",
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for short confirm_password", async () => {
      const passwordData = {
        current_password: "password123",
        new_password: "newpassword123",
        confirm_password: "123", // Too short
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should work for admin users", async () => {
      const passwordData = {
        current_password: "password123",
        new_password: "newadminpassword123",
        confirm_password: "newadminpassword123",
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.message).toBe("Password updated successfully");
    });

    it("should hash the new password properly", async () => {
      const passwordData = {
        current_password: "password123",
        new_password: "newpassword123",
        confirm_password: "newpassword123",
      };

      await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordData)
        .expect(200);

      // Verify old password no longer works
      const oldPasswordLogin = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testData.regularUser.email,
          password: "password123",
        })
        .expect(401);

      expect(oldPasswordLogin.body.msg).toBe("Invalid credentials");
    });

    it("should allow same password as new password (edge case)", async () => {
      const passwordData = {
        current_password: "password123",
        new_password: "password123",
        confirm_password: "password123",
      };

      const response = await request(app)
        .patch("/api/v1/user/update-password")
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.message).toBe("Password updated successfully");
    });
  });
});
