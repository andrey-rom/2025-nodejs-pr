import { Request, Response } from "express";
import { AuthController } from "../controllers/auth.controller";

jest.mock("../services/auth.service", () => ({
  AuthService: jest.fn().mockImplementation(() => mockAuthService),
}));

jest.mock("../utils/logger", () => {
  const mockLogger = { error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() };
  return { default: mockLogger, __esModule: true, ...mockLogger };
});

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe("AuthController", () => {
  let controller: AuthController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("register", () => {
    it("should register user successfully", async () => {
      const userData = {
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        password: "password123",
      };
      const authResponse = {
        token: "mock_token",
        user: { id: "uuid-1", ...userData },
      };

      mockReq = { body: userData };
      mockAuthService.register.mockResolvedValue(authResponse);

      await controller.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(authResponse);
    });

    it("should return 400 for validation error", async () => {
      mockReq = { body: { name: "John" } }; // Missing required fields

      await controller.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Validation failed" })
      );
    });

    it("should return 409 for existing user", async () => {
      mockReq = {
        body: {
          name: "John",
          surname: "Doe",
          email: "existing@example.com",
          password: "password123",
        },
      };
      mockAuthService.register.mockRejectedValue(
        new Error("User with this email already exists")
      );

      await controller.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const credentials = { email: "john@example.com", password: "password123" };
      const authResponse = { token: "mock_token", user: { email: credentials.email } };

      mockReq = { body: credentials };
      mockAuthService.login.mockResolvedValue(authResponse);

      await controller.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(authResponse);
    });

    it("should return 401 for invalid credentials", async () => {
      mockReq = { body: { email: "john@example.com", password: "wrongpass" } };
      mockAuthService.login.mockRejectedValue(new Error("Invalid email or password"));

      await controller.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return 400 for validation error", async () => {
      mockReq = { body: { email: "invalid-email" } };

      await controller.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("me", () => {
    it("should return current user", async () => {
      const user = { id: "uuid-1", email: "john@example.com" };
      mockReq = { user } as any;

      await controller.me(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ user });
    });

    it("should return 401 if no user", async () => {
      mockReq = {};

      await controller.me(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
