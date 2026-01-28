import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { RoleNames } from "../models/Role";

/**
 * Middleware to check if user has required role(s)
 * @param allowedRoles - Array of role names that are allowed to access the endpoint
 */
export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          error: "Unauthorized - User not authenticated",
        });
      }

      const userRole = user.roleName;

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: "Forbidden - You do not have permission to access this resource",
          required: allowedRoles,
          current: userRole,
        });
      }

      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      res.status(500).json({
        error: "Authorization check failed",
      });
    }
  };
};

// Predefined role middleware for admin only

export const adminOnly = roleMiddleware(RoleNames.ADMIN);


// Predefined role middleware for admin and teacher
export const adminOrTeacher = roleMiddleware(RoleNames.ADMIN, RoleNames.TEACHER);


// Predefined role middleware for all authenticated users

export const authenticated = roleMiddleware(
  RoleNames.ADMIN,
  RoleNames.TEACHER,
  RoleNames.STUDENT
);
