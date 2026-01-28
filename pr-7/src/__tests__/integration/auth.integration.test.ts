// mock database before importing app
jest.mock("../../database/data-source", () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(true),
    getRepository: jest.fn(),
  },
}));

// prevent console output
jest.mock("../../utils/logger", () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockLogger,
    logger: mockLogger,
  };
});

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  verifyToken: jest.fn(),
  getUserById: jest.fn(),
};

jest.mock("../../services/auth.service", () => {
  return {
    AuthService: jest.fn().mockImplementation(() => mockAuthService),
  };
});

import request from "supertest";
import { app } from "../../index";

describe("Auth Integration Tests", () => {
  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const mockResponse = {
        token: "mock_token",
        user: {
          id: "user-1",
          name: "Andrey",
          surname: "Doe",
          email: "andrey@test.com",
          role: { id: 3, name: "student" },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Andrey",
          surname: "Doe",
          email: "andrey@test.com",
          password: "password123",
        })
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe("andrey@test.com");
    });

    it("should return 400 for invalid input", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "",
          email: "invalid-email",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 409 if user already exists", async () => {
      mockAuthService.register.mockRejectedValue(new Error("User with this email already exists"));

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Andrey",
          surname: "Doe",
          email: "existing@test.com",
          password: "password123",
        })
        .expect(409);

      expect(response.body.error).toBe("User with this email already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user with valid credentials", async () => {
      const mockResponse = {
        token: "mock_token",
        user: {
          id: "user-1",
          name: "Andrey",
          surname: "Doe",
          email: "andrey@test.com",
          role: { id: 3, name: "student" },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "andrey@test.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
    });

    it("should return 401 for invalid credentials", async () => {
      mockAuthService.login.mockRejectedValue(new Error("Invalid email or password"));

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "wrong@test.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.error).toBe("Invalid email or password");
    });

    it("should return 400 for invalid input", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "invalid-email",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return user info with valid token", async () => {
      const mockUser = {
        id: "user-1",
        email: "andrey@test.com",
        name: "Andrey",
        surname: "Doe",
        roleId: 3,
        roleName: "student",
      };

      mockAuthService.verifyToken.mockReturnValue({
        id: "user-1",
        email: "andrey@test.com",
      });
      mockAuthService.getUserById.mockResolvedValue({
        id: "user-1",
        email: "andrey@test.com",
        name: "Andrey",
        surname: "Doe",
        roleId: 3,
        role: { id: 3, name: "student" },
      });

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer valid_token")
        .expect(200);

      expect(response.body).toHaveProperty("user");
    });

    it("should return 401 without authorization header", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 401 with invalid token", async () => {
      mockAuthService.verifyToken.mockImplementation(() => {
        throw new Error("Invalid or expired token");
      });

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });
});
