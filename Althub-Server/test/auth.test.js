const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index"); // Import your Express app

let mongoServer;

// --- Setup: Connect to In-Memory DB before tests ---
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// --- Teardown: Disconnect and Close DB after tests ---
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  // Close the server connection if it's still open
  // Note: You might need to export 'server' from index.js to close it cleanly here
});

describe("Auth API Endpoints", () => {
  
  // Test User Data
  const testUser = {
    fname: "John",
    lname: "Doe",
    email: "test@example.com",
    password: "password123",
    role: "student",
    phone: "1234567890",
    confirmPassword: "password123"
  };

  // 1. POST /api/register
  describe("POST /api/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/register")
        .send(testUser);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("token"); // Should return JWT
    });

    it("should fail if email already exists", async () => {
      // Send same user again
      const res = await request(app)
        .post("/api/register")
        .send(testUser);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body.msg).toMatch(/User already exists/i);
    });
  });

  // 2. POST /api/userLogin
  describe("POST /api/userLogin", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/userLogin")
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("email", testUser.email);
    });

    it("should fail login with invalid password", async () => {
      const res = await request(app)
        .post("/api/userLogin")
        .send({
          email: testUser.email,
          password: "wrongpassword"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

});