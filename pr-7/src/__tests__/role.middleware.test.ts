import { Response, NextFunction } from "express";
import { roleMiddleware } from "../middleware/role.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { RoleNames } from "../models/Role";

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

describe("roleMiddleware", () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  it("should return 401 if user is not authenticated", () => {
    const middleware = roleMiddleware(RoleNames.ADMIN);
    middleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized - User not authenticated",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow access if user has required role", () => {
    req.user = {
      id: "admin-1",
      email: "admin@example.com",
      roleName: RoleNames.ADMIN,
    };

    const middleware = roleMiddleware(RoleNames.ADMIN);
    middleware(req as AuthenticatedRequest, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should deny access if user does not have required role", () => {
    req.user = {
      id: "student-1",
      email: "student@example.com",
      roleName: RoleNames.STUDENT,
    };

    const middleware = roleMiddleware(RoleNames.ADMIN);
    middleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden - You do not have permission to access this resource",
      required: [RoleNames.ADMIN],
      current: RoleNames.STUDENT,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow access if user has one of multiple allowed roles", () => {
    req.user = {
      id: "teacher-1",
      email: "teacher@example.com",
      roleName: RoleNames.TEACHER,
    };

    const middleware = roleMiddleware(RoleNames.ADMIN, RoleNames.TEACHER);
    middleware(req as AuthenticatedRequest, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
