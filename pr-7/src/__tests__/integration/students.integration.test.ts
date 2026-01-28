
jest.mock("../../database/data-source", () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(true),
    getRepository: jest.fn(),
  },
}));

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
  verifyToken: jest.fn(),
  getUserById: jest.fn(),
};

const mockStudentsService = {
  getAllStudents: jest.fn(),
  getStudentById: jest.fn(),
  calculateAverageAge: jest.fn(),
  getStudentsByGroup: jest.fn(),
  addStudent: jest.fn(),
  updateStudent: jest.fn(),
  deleteStudent: jest.fn(),
};

jest.mock("../../services/auth.service", () => {
  return {
    AuthService: jest.fn().mockImplementation(() => mockAuthService),
  };
});

jest.mock("../../services/students.service", () => {
  return {
    StudentsService: jest.fn().mockImplementation(() => mockStudentsService),
  };
});

import request from "supertest";
import { app } from "../../index";

describe("Students Integration Tests", () => {
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup auth mocks for different roles
    const mockAdminUser = {
      id: "admin-1",
      email: "admin@test.com",
      name: "Admin",
      surname: "User",
      roleId: 1,
      role: { id: 1, name: "admin" },
    };

    const mockTeacherUser = {
      id: "teacher-1",
      email: "teacher@test.com",
      name: "Teacher",
      surname: "User",
      roleId: 2,
      role: { id: 2, name: "teacher" },
    };

    const mockStudentUser = {
      id: "student-1",
      email: "student@test.com",
      name: "Student",
      surname: "User",
      roleId: 3,
      role: { id: 3, name: "student" },
    };

    mockAuthService.verifyToken.mockImplementation((token) => {
      if (token === "admin_token") return { id: "admin-1", email: "admin@test.com" };
      if (token === "teacher_token") return { id: "teacher-1", email: "teacher@test.com" };
      if (token === "student_token") return { id: "student-1", email: "student@test.com" };
      throw new Error("Invalid token");
    });

    mockAuthService.getUserById.mockImplementation((id) => {
      if (id === "admin-1") return Promise.resolve(mockAdminUser);
      if (id === "teacher-1") return Promise.resolve(mockTeacherUser);
      if (id === "student-1") return Promise.resolve(mockStudentUser);
      return Promise.resolve(null);
    });

    adminToken = "admin_token";
    teacherToken = "teacher_token";
    studentToken = "student_token";
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/students", () => {
    it("should get all students for authenticated user", async () => {
      const mockStudents = [
        { id: 1, name: "Andrey", age: 20, group: 1 },
        { id: 2, name: "Maria", age: 21, group: 1 },
      ];

      mockStudentsService.getAllStudents.mockResolvedValue(mockStudents);

      const response = await request(app)
        .get("/api/students")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it("should return 401 without token", async () => {
      await request(app)
        .get("/api/students")
        .expect(401);
    });
  });

  describe("GET /api/students/:id", () => {
    it("should get student by id", async () => {
      const mockStudent = { id: 1, name: "Andrey", age: 20, group: 1 };

      mockStudentsService.getStudentById.mockResolvedValue(mockStudent);

      const response = await request(app)
        .get("/api/students/1")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe("Andrey");
    });

    it("should return 404 for non-existent student", async () => {
      mockStudentsService.getStudentById.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/students/999")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for invalid id", async () => {
      const response = await request(app)
        .get("/api/students/invalid")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/students/average-age", () => {
    it("should calculate average age for admin", async () => {
      mockStudentsService.calculateAverageAge.mockResolvedValue(20.5);

      const response = await request(app)
        .get("/api/students/average-age")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("averageAge");
      expect(response.body.averageAge).toBe(20.5);
    });

    it("should calculate average age for teacher", async () => {
      mockStudentsService.calculateAverageAge.mockResolvedValue(20.5);

      const response = await request(app)
        .get("/api/students/average-age")
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("averageAge");
    });

    it("should return 403 for student", async () => {
      await request(app)
        .get("/api/students/average-age")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe("GET /api/students/group/:groupId", () => {
    it("should get students by group for admin", async () => {
      const mockStudents = [
        { id: 1, name: "Andrey", age: 20, group: 1 },
        { id: 2, name: "Maria", age: 21, group: 1 },
      ];

      mockStudentsService.getStudentsByGroup.mockResolvedValue(mockStudents);

      const response = await request(app)
        .get("/api/students/group/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 404 if no students in group", async () => {
      mockStudentsService.getStudentsByGroup.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/students/group/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/students", () => {
    it("should create student as admin", async () => {
      const newStudent = { id: 3, name: "New Student", age: 19, group: 1 };

      mockStudentsService.addStudent.mockResolvedValue(newStudent);

      const response = await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "New Student",
          age: 19,
          group: 1,
        })
        .expect(201);

      expect(response.body.name).toBe("New Student");
    });

    it("should create student as teacher", async () => {
      const newStudent = { id: 3, name: "New Student", age: 19, group: 1 };

      mockStudentsService.addStudent.mockResolvedValue(newStudent);

      const response = await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          name: "New Student",
          age: 19,
          group: 1,
        })
        .expect(201);

      expect(response.body.name).toBe("New Student");
    });

    it("should return 403 for student", async () => {
      await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          name: "New Student",
          age: 19,
          group: 1,
        })
        .expect(403);
    });

    it("should return 400 for invalid input", async () => {
      const response = await request(app)
        .post("/api/students")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "",
          age: -1,
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/students/:id", () => {
    it("should update student as admin", async () => {
      const updatedStudent = { id: 1, name: "Updated Name", age: 21, group: 1 };

      mockStudentsService.getStudentById.mockResolvedValue({ id: 1 });
      mockStudentsService.updateStudent.mockResolvedValue(updatedStudent);

      const response = await request(app)
        .put("/api/students/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Name",
          age: 21,
        })
        .expect(200);

      expect(response.body.name).toBe("Updated Name");
    });

    it("should return 404 for non-existent student", async () => {
      mockStudentsService.getStudentById.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/students/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Name",
        })
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/students/:id", () => {
    it("should delete student as admin", async () => {
      const deletedStudent = { id: 1, name: "Andrey", age: 20, group: 1 };

      mockStudentsService.deleteStudent.mockResolvedValue(deletedStudent);

      const response = await request(app)
        .delete("/api/students/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
    });

    it("should return 403 for teacher", async () => {
      await request(app)
        .delete("/api/students/1")
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(403);
    });

    it("should return 404 for non-existent student", async () => {
      mockStudentsService.deleteStudent.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/students/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });
});
