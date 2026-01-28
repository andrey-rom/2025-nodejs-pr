import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Authorization header is required",
      });
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Invalid authorization header format. Expected: Bearer <token>",
      });
    }

    const token = parts[1];

    // Verify token
    const authService = new AuthService();
    const decoded = authService.verifyToken(token);

    // Get user from database
    const user = await authService.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      roleId: user.roleId,
      roleName: user.role.name,
    };

    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);

    if (error.message === "Invalid or expired token") {
      return res.status(401).json({
        error: error.message,
      });
    }

    res.status(401).json({
      error: "Authentication failed",
    });
  }
};
