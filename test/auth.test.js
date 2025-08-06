const request = require("supertest");
const { app, server } = require("../server");
const { dataOperations } = require("../src/data/store");
const sendEmail = require("../src/utils/sendEmail");

// Mock the sendEmail utility to test email functionality
jest.mock("../src/utils/sendEmail");

describe("Auth Routes", () => {
  afterAll(() => {
    server.close();
  });
  describe("POST /api/v1/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "newuser@test.com",
        first_name: "New",
        last_name: "User",
        password: "password123",
        address: "123 New Street",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe(201);
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data.user).toHaveProperty("email", userData.email);
      expect(response.body.data.user).not.toHaveProperty("password");
      expect(response.body.data.user.role).toBe("user"); // Not first account
    });

    it("should register first user as admin", async () => {
      // Clear users to make this the first account
      const store = require("../src/data/store");
      Object.assign(store.storage, {
        users: [],
        cars: [],
        orders: [],
        flags: [],
        resetTokens: [],
      });

      const userData = {
        email: "firstuser@test.com",
        first_name: "First",
        last_name: "User",
        password: "password123",
        address: "123 First Street",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.data.user.role).toBe("admin");
    });

    it("should return 400 for duplicate email", async () => {
      const userData = {
        email: "admin@test.com", // This email already exists in test data
        first_name: "Test",
        last_name: "User",
        password: "password123",
        address: "123 Test Street",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.msg).toBe("Email already exists");
    });

    it("should return 400 for invalid email format", async () => {
      const userData = {
        email: "invalid-email",
        first_name: "Test",
        last_name: "User",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for short password", async () => {
      const userData = {
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        password: "123", // Too short
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for missing required fields", async () => {
      const userData = {
        email: "test@example.com",
        // Missing required fields
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const loginData = {
        email: "admin@test.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data.user).toHaveProperty("email", loginData.email);
      expect(response.body.data.user).not.toHaveProperty("password");
    });

    it("should return 401 for invalid email", async () => {
      const loginData = {
        email: "nonexistent@test.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.msg).toBe("Invalid credentials");
    });

    it("should return 401 for invalid password", async () => {
      const loginData = {
        email: "admin@test.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.msg).toBe("Invalid credentials");
    });

    it("should return 400 for missing email", async () => {
      const loginData = {
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body.msg).toBe("Please provide a valid email");
    });

    it("should return 400 for missing password", async () => {
      const loginData = {
        email: "admin@test.com",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body.msg).toBe("Password is required");
    });

    it("should return 400 for invalid email format", async () => {
      const loginData = {
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
      // Set required environment variable
      process.env.FRONTEND_URL = "http://localhost:3000";
    });

    it("should create password reset token for existing user", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "admin@test.com" })
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.message).toBe("Password reset token created");
    });

    it("should send password reset email to existing user", async () => {
      const email = "admin@test.com";

      await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email })
        .expect(200);

      // Verify that sendEmail was called
      expect(sendEmail).toHaveBeenCalledTimes(1);

      // Verify the email content
      const emailCall = sendEmail.mock.calls[0][0];
      expect(emailCall.to).toBe(email);
      expect(emailCall.subject).toBe("Reset Password");
      expect(emailCall.html).toContain("Hello, Admin"); // User's first name
      expect(emailCall.html).toContain("Reset Password"); // Link text
      expect(emailCall.html).toContain("http://localhost:3000/reset-password"); // Reset URL
      expect(emailCall.html).toContain("token="); // Contains token parameter
      expect(emailCall.html).toContain("email=admin@test.com"); // Contains email parameter
    });

    it("should not send email for non-existent user but still return success", async () => {
      const email = "nonexistent@test.com";

      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email })
        .expect(200);

      expect(response.body.message).toBe("Password reset token created");

      // Verify that sendEmail was NOT called for non-existent user
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it("should generate unique tokens for multiple requests", async () => {
      const email = "admin@test.com";

      // First request
      await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email })
        .expect(200);

      // Second request
      await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email })
        .expect(200);

      // Verify sendEmail was called twice
      expect(sendEmail).toHaveBeenCalledTimes(2);

      // Extract tokens from both calls
      const firstEmailHtml = sendEmail.mock.calls[0][0].html;
      const secondEmailHtml = sendEmail.mock.calls[1][0].html;

      const firstToken = firstEmailHtml.match(/token=([^&]+)/)[1];
      const secondToken = secondEmailHtml.match(/token=([^&]+)/)[1];

      // Tokens should be different
      expect(firstToken).not.toBe(secondToken);
    });

    it("should handle email sending errors gracefully", async () => {
      // Mock sendEmail to throw an error
      sendEmail.mockRejectedValueOnce(new Error("SMTP connection failed"));

      const email = "admin@test.com";

      // The API should still return 500 when email fails
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email })
        .expect(500);

      // Verify that sendEmail was called
      expect(sendEmail).toHaveBeenCalledTimes(1);

      // The error should be handled by express-async-errors middleware
      expect(response.body.msg).toContain("SMTP connection failed");
    });

    it("should include correct reset URL with proper parameters", async () => {
      const email = "user@test.com";

      await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email })
        .expect(200);

      const emailCall = sendEmail.mock.calls[0][0];
      const resetUrl = emailCall.html.match(/href="([^"]+)"/)[1];

      expect(resetUrl).toMatch(
        /^http:\/\/localhost:3000\/reset-password\?token=.+&email=user@test\.com$/
      );

      // Extract and verify token format (should be 140 hex characters from crypto.randomBytes(70))
      const token = resetUrl.match(/token=([^&]+)/)[1];
      expect(token).toHaveLength(140);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true); // Should be hex
    });

    it("should return success even for non-existent email (security)", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "nonexistent@test.com" })
        .expect(200);

      expect(response.body.message).toBe("Password reset token created");
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "invalid-email" })
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for missing data", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({})
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
      expect(response.body.msg).toContain("Please provide a valid email");
    });
  });

  describe("POST /api/v1/auth/reset-password", () => {
    let resetToken;

    beforeEach(async () => {
      // Create a reset token for testing
      const crypto = require("crypto");
      const createHash = require("../src/utils/createHash");

      resetToken = crypto.randomBytes(70).toString("hex");
      const resetTokenHash = createHash(resetToken);

      dataOperations.createResetToken(
        "admin-user-id",
        "admin@test.com",
        resetTokenHash
      );
    });

    it("should reset password successfully with valid token", async () => {
      const resetData = {
        token: resetToken,
        email: "admin@test.com",
        new_password: "newpassword123",
      };

      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send(resetData)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.message).toBe(
        "Password has been reset successfully"
      );
    });

    it("should return 401 for invalid token", async () => {
      const resetData = {
        token: "invalid-token",
        email: "admin@test.com",
        new_password: "newpassword123",
      };

      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send(resetData)
        .expect(401);

      expect(response.body.msg).toBe("Invalid or expired reset token");
    });

    it("should return 404 for non-existent user", async () => {
      const resetData = {
        token: resetToken,
        email: "nonexistent@test.com",
        new_password: "newpassword123",
      };

      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send(resetData)
        .expect(404);

      expect(response.body.msg).toBe("User not found");
    });

    it("should return 400 for missing required fields", async () => {
      const resetData = {
        token: resetToken,
        // Missing email and new_password
      };

      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send(resetData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for short new password", async () => {
      const resetData = {
        token: resetToken,
        email: "admin@test.com",
        new_password: "123", // Too short
      };

      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send(resetData)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });
  });
});
