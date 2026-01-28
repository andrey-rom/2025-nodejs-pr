import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import {
  UserRegistrationSchema,
  UserLoginSchema,
  IUserRegistration,
  IUserLogin,
} from "../models/User";
import logger from "../utils/logger";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (
    req: Request<{}, {}, IUserRegistration>,
    res: Response
  ) => {
    try {
      const { error, value } = UserRegistrationSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.details.map((item: any) => item.message),
        });
      }

      const result = await this.authService.register(value);

      res.status(201).json(result);
    } catch (error: any) {
      logger.error("Registration error:", error);
      
      if (error.message === "User with this email already exists") {
        return res.status(409).json({
          error: error.message,
        });
      }

      res.status(500).json({
        error: "Failed to register user",
      });
    }
  };

  public login = async (req: Request<{}, {}, IUserLogin>, res: Response) => {
    try {
      const { error, value } = UserLoginSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.details.map((item: any) => item.message),
        });
      }

      const result = await this.authService.login(value);

      res.status(200).json(result);
    } catch (error: any) {
      logger.error("Login error:", error);

      if (error.message === "Invalid email or password") {
        return res.status(401).json({
          error: error.message,
        });
      }

      res.status(500).json({
        error: "Failed to login",
      });
    }
  };

  public me = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      res.status(200).json({
        user,
      });
    } catch (error) {
      logger.error("Get user info error:", error);
      res.status(500).json({
        error: "Failed to get user information",
      });
    }
  };
}
