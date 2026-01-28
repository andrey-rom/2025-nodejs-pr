import { Request, Response } from "express";
import { StudentsController } from "../controllers/students.controller";

jest.mock("../services/students.service", () => ({
  StudentsService: jest.fn().mockImplementation(() => mockStudentsService),
}));

jest.mock("../utils/logger", () => {
  const mockLogger = { error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() };
  return { default: mockLogger, __esModule: true, ...mockLogger };
});

const mockStudentsService = {
  getAllStudents: jest.fn(),
  getStudentById: jest.fn(),
  getStudentsByGroup: jest.fn(),
  calculateAverageAge: jest.fn(),
  addStudent: jest.fn(),
  updateStudent: jest.fn(),
  deleteStudent: jest.fn(),
};

describe("StudentsController", () => {
  let controller: StudentsController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new StudentsController();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getAllStudents", () => {
    it("should return all students", async () => {
      const students = [
        { id: 1, name: "John", age: 20, group: 101 },
        { id: 2, name: "Jane", age: 21, group: 102 },
      ];
      mockStudentsService.getAllStudents.mockResolvedValue(students);
      mockReq = {};

      await controller.getAllStudents(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(students);
    });

    it("should return 500 on error", async () => {
      mockStudentsService.getAllStudents.mockRejectedValue(new Error("DB error"));
      mockReq = {};

      await controller.getAllStudents(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getStudentById", () => {
    it("should return student by id", async () => {
      const student = { id: 1, name: "John", age: 20, group: 101 };
      mockStudentsService.getStudentById.mockResolvedValue(student);
      mockReq = { params: { id: "1" } };

      await controller.getStudentById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(student);
    });

    it("should return 400 for invalid id", async () => {
      mockReq = { params: { id: "invalid" } };

      await controller.getStudentById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if not found", async () => {
      mockStudentsService.getStudentById.mockResolvedValue(null);
      mockReq = { params: { id: "999" } };

      await controller.getStudentById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getStudentsByGroup", () => {
    it("should return students by group", async () => {
      const students = [{ id: 1, name: "John", age: 20, group: 101 }];
      mockStudentsService.getStudentsByGroup.mockResolvedValue(students);
      mockReq = { params: { groupId: "101" } };

      await controller.getStudentsByGroup(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(students);
    });

    it("should return 404 if no students in group", async () => {
      mockStudentsService.getStudentsByGroup.mockResolvedValue([]);
      mockReq = { params: { groupId: "999" } };

      await controller.getStudentsByGroup(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("calculateAverageAge", () => {
    it("should return average age", async () => {
      mockStudentsService.calculateAverageAge.mockResolvedValue(20.5);
      mockReq = {};

      await controller.calculateAverageAge(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ averageAge: 20.5 });
    });
  });

  describe("addStudent", () => {
    it("should add student successfully", async () => {
      const newStudent = { id: 1, name: "John Doe", age: 20, group: 1 };
      mockStudentsService.addStudent.mockResolvedValue(newStudent);
      mockReq = { body: { name: "John Doe", age: 20, group: 1 } };

      await controller.addStudent(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(newStudent);
    });

    it("should return 400 for validation error", async () => {
      mockReq = { body: { name: "J" } }; // Missing age and group, name too short

      await controller.addStudent(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateStudent", () => {
    it("should update student successfully", async () => {
      const student = { id: 1, name: "John", age: 20, group: 101 };
      const updatedStudent = { ...student, name: "John Updated" };
      mockStudentsService.getStudentById.mockResolvedValue(student);
      mockStudentsService.updateStudent.mockResolvedValue(updatedStudent);
      mockReq = { params: { id: "1" }, body: { name: "John Updated" } };

      await controller.updateStudent(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedStudent);
    });

    it("should return 404 if student not found", async () => {
      mockStudentsService.getStudentById.mockResolvedValue(null);
      mockReq = { params: { id: "999" }, body: { name: "Test" } };

      await controller.updateStudent(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteStudent", () => {
    it("should delete student successfully", async () => {
      const student = { id: 1, name: "John", age: 20, group: 101 };
      mockStudentsService.deleteStudent.mockResolvedValue(student);
      mockReq = { params: { id: "1" } };

      await controller.deleteStudent(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Student with id 1 deleted successfully",
        student,
      });
    });

    it("should return 404 if student not found", async () => {
      mockStudentsService.deleteStudent.mockResolvedValue(null);
      mockReq = { params: { id: "999" } };

      await controller.deleteStudent(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
