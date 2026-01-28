import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../database/data-source";
import { User } from "../models/User/User.entity";
import { Role, RoleNames } from "../models/Role";
import {
  IUserRegistration,
  IUserLogin,
  IAuthResponse,
  IUserResponse,
} from "../models/User";
import logger from "../utils/logger";

export class AuthService {
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;
  private saltRounds = 10;
  private jwtSecret: string;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
  }

  public async register(userData: IUserRegistration): Promise<IAuthResponse> {
    try {
      logger.info(`Attempting to register user with email: ${userData.email}`);
      
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        logger.warn(`Registration failed: User with email ${userData.email} already exists`);
        throw new Error("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, this.saltRounds);

      // get role - default to student if not provided
      let roleId = userData.roleId;
      if (!roleId) {
        const studentRole = await this.roleRepository.findOne({
          where: { name: RoleNames.STUDENT },
        });
        roleId = studentRole?.id || 3; //  3 if student role not found
      }

      // Create user
      const user = this.userRepository.create({
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        password: hashedPassword,
        roleId: roleId,
      });

      const savedUser = await this.userRepository.save(user);

      // Fetch user with role relationship
      const userWithRole = await this.userRepository.findOne({
        where: { id: savedUser.id },
        relations: ["role"],
      });

      if (!userWithRole) {
        throw new Error("Failed to create user");
      }

      // generate JWT token
      const token = this.generateToken(userWithRole);

      logger.info(`User registered successfully: ${userWithRole.email}`);
      logger.debug(`User ID: ${userWithRole.id}, Role: ${userWithRole.role?.name}`);

      return {
        token,
        user: this.formatUserResponse(userWithRole),
      };
    } catch (error) {
      logger.error("Error in registration:", error);
      throw error;
    }
  }

  public async login(credentials: IUserLogin): Promise<IAuthResponse> {
    try {
      logger.info(`Login attempt for email: ${credentials.email}`);
      
      // find user by email
      const user = await this.userRepository.findOne({
        where: { email: credentials.email },
        relations: ["role"],
      });

      if (!user) {
        logger.warn(`Login failed: User not found for email ${credentials.email}`);
        throw new Error("Invalid email or password");
      }

      // verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

      if (!isPasswordValid) {
        logger.warn(`Login failed: Invalid password for email ${credentials.email}`);
        throw new Error("Invalid email or password");
      }

      // generate JWT token
      const token = this.generateToken(user);

      logger.info(`User logged in successfully: ${user.email}`);
      logger.debug(`User ID: ${user.id}, Role: ${user.role?.name}`);

      return {
        token,
        user: this.formatUserResponse(user),
      };
    } catch (error) {
      logger.error("Error in login:", error);
      throw error;
    }
  }

  public async getUserById(userId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id: userId },
        relations: ["role"],
      });
    } catch (error) {
      logger.error("Error getting user by id:", error);
      throw error;
    }
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name || "student",
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: "24h",
    });
  }

  private formatUserResponse(user: User): IUserResponse {
    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}
