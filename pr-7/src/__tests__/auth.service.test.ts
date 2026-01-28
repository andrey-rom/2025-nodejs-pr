import { AuthService } from "../services/auth.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

jest.mock("../database/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn((entity) => {
      if (entity.name === "User") return mockUserRepository;
      if (entity.name === "Role") return mockRoleRepository;
      return {};
    }),
  },
}));

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockRoleRepository = {
  findOne: jest.fn(),
};

describe("AuthService", () => {
  let service: AuthService;
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const userData = {
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        password: "password123",
      };

      const hashedPassword = "hashed_password";
      const savedUser = {
        id: "uuid-1",
        ...userData,
        password: hashedPassword,
        roleId: 3,
        role: { id: 3, name: "student" },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // Check existing user
        .mockResolvedValueOnce(savedUser); // Fetch with role
      mockRoleRepository.findOne.mockResolvedValue({ id: 3, name: "student" });
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (jwt.sign as jest.Mock).mockReturnValue("mock_token");

      const result = await service.register(userData);

      expect(result.token).toBe("mock_token");
      expect(result.user.email).toBe(userData.email);
    });

    it("should throw error if user already exists", async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: "existing" });

      await expect(
        service.register({
          name: "John",
          surname: "Doe",
          email: "existing@example.com",
          password: "password123",
        })
      ).rejects.toThrow("User with this email already exists");
    });

    it("should throw error if userWithRole is null after save", async () => {
      const userData = {
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        password: "password123",
      };

      const savedUser = {
        id: "uuid-1",
        ...userData,
        password: "hashed_password",
        roleId: 3,
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // Check existing user
        .mockResolvedValueOnce(null); // Fetch with role returns null
      mockRoleRepository.findOne.mockResolvedValue({ id: 3, name: "student" });
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");

      await expect(service.register(userData)).rejects.toThrow("Failed to create user");
    });
  });

  describe("login", () => {
    it("should login user with valid credentials", async () => {
      const user = {
        id: "uuid-1",
        email: "john@example.com",
        password: "hashed_password",
        name: "John",
        surname: "Doe",
        roleId: 3,
        role: { id: 3, name: "student" },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("mock_token");

      const result = await service.login({
        email: "john@example.com",
        password: "password123",
      });

      expect(result.token).toBe("mock_token");
      expect(result.user.email).toBe(user.email);
    });

    it("should throw error for invalid email", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: "wrong@example.com", password: "password" })
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw error for invalid password", async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: "uuid-1",
        email: "john@example.com",
        password: "hashed",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: "john@example.com", password: "wrong" })
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("verifyToken", () => {
    it("should verify valid token", () => {
      const payload = { id: "uuid-1", email: "test@example.com" };
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      const result = service.verifyToken("valid_token");

      expect(result).toEqual(payload);
    });

    it("should throw error for invalid token", () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => service.verifyToken("invalid_token")).toThrow(
        "Invalid or expired token"
      );
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      const mockUser = {
        id: "uuid-1",
        email: "test@example.com",
        name: "John",
        surname: "Doe",
        roleId: 3,
        role: { id: 3, name: "student" },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById("uuid-1");

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        relations: ["role"],
      });
    });

    it("should return null if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserById("non-existent");

      expect(result).toBeNull();
    });

    it("should throw error on database error", async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error("Database error"));

      await expect(service.getUserById("uuid-1")).rejects.toThrow("Database error");
    });
  });
});
