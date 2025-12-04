const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/userModel"); // Import the User model

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // FIX: Create user using the Mongoose Model instead of raw collection
  const user = await User.create({
    fname: "Test",
    lname: "User",
    email: "testpost@user.com",
    password: "hashedpassword",
    role: "student",
    institute: "Test Institute"
  });
  
  userId = user._id;
  token = jwt.sign({ _id: userId }, config.secret_jwt);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Post API Endpoints", () => {
  
  // 1. Test Creating a Post
  it("POST /api/addPost - should create a new post", async () => {
    const res = await request(app)
      .post("/api/addPost")
      .set("Cookie", [`jwt_token=${token}`])
      .send({
        userid: userId,
        fname: "Test",
        lname: "User",
        title: "My First Test Post",
        description: "This is a test content",
        date: new Date()
      });

    // If this fails, it prints the error message
    if (res.statusCode !== 200) {
      console.error("Add Post Error:", res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  // 2. Test Getting All Posts
  it("GET /api/getPost - should retrieve posts", async () => {
    const res = await request(app).get("/api/getPost");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // 3. Test Liking a Post
  it("PUT /api/like/:id - should like a post", async () => {
    // First get a post ID from the previous test
    const posts = await request(app).get("/api/getPost");
    const postId = posts.body.data[0]._id;

    const res = await request(app)
      .put(`/api/like/${postId}`)
      .set("Cookie", [`jwt_token=${token}`])
      .send({
        userId: userId
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.msg).toMatch(/Like|disliked/i);
  });
});