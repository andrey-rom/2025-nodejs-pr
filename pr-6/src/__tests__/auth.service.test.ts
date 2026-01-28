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
});
