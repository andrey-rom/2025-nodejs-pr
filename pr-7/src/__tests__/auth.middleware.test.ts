import { Request, Response, NextFunction } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.middleware";
import { AuthService } from "../services/auth.service";

const mockAuthService = {
  verifyToken: jest.fn(),
  getUserById: jest.fn(),
};

jest.mock("../services/auth.service", () => {
  return {
    AuthService: jest.fn().mockImplementation(() => mockAuthService),
  };
});

jest.mock("../utils/logger", () => {
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

describe("authMiddleware", () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  it("should return 401 if no authorization header", async () => {
    await authMiddleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Authorization header is required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header format is invalid (no Bearer)", async () => {
    req.headers = { authorization: "InvalidToken" };

    await authMiddleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid authorization header format. Expected: Bearer <token>",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header has wrong format (more than 2 parts)", async () => {
    req.headers = { authorization: "Bearer token extra" };

    await authMiddleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid authorization header format. Expected: Bearer <token>",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if user not found", async () => {
    req.headers = { authorization: "Bearer valid_token" };
    (mockAuthService.verifyToken as jest.Mock).mockReturnValue({ id: "user-1", email: "test@example.com" });
    (mockAuthService.getUserById as jest.Mock).mockResolvedValue(null);

    await authMiddleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "User not found",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should authenticate user successfully", async () => {
    req.headers = { authorization: "Bearer valid_token" };
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      name: "John",
      surname: "Doe",
      roleId: 3,
      role: { id: 3, name: "student" },
    };

    (mockAuthService.verifyToken as jest.Mock).mockReturnValue({ id: "user-1", email: "test@example.com" });
    (mockAuthService.getUserById as jest.Mock).mockResolvedValue(mockUser as any);

    await authMiddleware(req as AuthenticatedRequest, res as Response, next);

    expect(req.user).toEqual({
      id: "user-1",
      email: "test@example.com",
      name: "John",
      surname: "Doe",
      roleId: 3,
      roleName: "student",
    });
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 for invalid token error", async () => {
    req.headers = { authorization: "Bearer invalid_token" };
    (mockAuthService.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid or expired token");
    });

    await authMiddleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for other errors", async () => {
    req.headers = { authorization: "Bearer token" };
    (mockAuthService.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error("Some other error");
    });

    await authMiddleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Authentication failed",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
