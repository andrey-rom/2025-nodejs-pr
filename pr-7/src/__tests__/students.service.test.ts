import { StudentsService } from "../services/students.service";

jest.mock("../database/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockRepository),
  },
}));

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

describe("StudentsService", () => {
  let service: StudentsService;
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StudentsService();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("getAllStudents", () => {
    it("should return all students", async () => {
      const mockStudents = [
        { id: 1, name: "John", age: 20, group: 101 },
        { id: 2, name: "Jane", age: 21, group: 102 },
      ];
      mockRepository.find.mockResolvedValue(mockStudents);

      const result = await service.getAllStudents();

      expect(result).toEqual(mockStudents);
      expect(mockRepository.find).toHaveBeenCalledWith({ order: { id: "ASC" } });
    });

    it("should throw error on failure", async () => {
      mockRepository.find.mockRejectedValue(new Error("DB error"));

      await expect(service.getAllStudents()).rejects.toThrow("Failed to get all students");
    });
  });

  describe("getStudentById", () => {
    it("should return student by id", async () => {
      const mockStudent = { id: 1, name: "John", age: 20, group: 101 };
      mockRepository.findOne.mockResolvedValue(mockStudent);

      const result = await service.getStudentById(1);

      expect(result).toEqual(mockStudent);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("should return null if student not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getStudentById(999);

      expect(result).toBeNull();
    });

    it("should throw error on failure", async () => {
      mockRepository.findOne.mockRejectedValue(new Error("DB error"));

      await expect(service.getStudentById(1)).rejects.toThrow("Failed to get student by id");
    });
  });

  describe("getStudentsByGroup", () => {
    it("should return students by group", async () => {
      const mockStudents = [{ id: 1, name: "John", age: 20, group: 101 }];
      mockRepository.find.mockResolvedValue(mockStudents);

      const result = await service.getStudentsByGroup(101);

      expect(result).toEqual(mockStudents);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { group: 101 },
        order: { id: "ASC" },
      });
    });

    it("should throw error on failure", async () => {
      mockRepository.find.mockRejectedValue(new Error("DB error"));

      await expect(service.getStudentsByGroup(101)).rejects.toThrow("Failed to get students by group");
    });
  });

  describe("calculateAverageAge", () => {
    it("should calculate average age", async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: "20.5" }),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.calculateAverageAge();

      expect(result).toBe(20.5);
    });

    it("should return 0 if no students", async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: null }),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.calculateAverageAge();

      expect(result).toBe(0);
    });

    it("should throw error on failure", async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockRejectedValue(new Error("DB error")),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.calculateAverageAge()).rejects.toThrow("Failed to calculate average age");
    });
  });

  describe("addStudent", () => {
    it("should add a new student", async () => {
      const newStudent = { id: 1, name: "John", age: 20, group: 101 };
      mockRepository.create.mockReturnValue(newStudent);
      mockRepository.save.mockResolvedValue(newStudent);

      const result = await service.addStudent("John", 20, 101);

      expect(result).toEqual(newStudent);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: "John",
        age: 20,
        group: 101,
      });
    });

    it("should throw error on failure", async () => {
      mockRepository.create.mockReturnValue({ name: "John", age: 20, group: 101 });
      mockRepository.save.mockRejectedValue(new Error("DB error"));

      await expect(service.addStudent("John", 20, 101)).rejects.toThrow("Failed to add student");
    });
  });

  describe("updateStudent", () => {
    it("should update student", async () => {
      const existingStudent = { id: 1, name: "John", age: 20, group: 101 };
      const updatedStudent = { id: 1, name: "John Updated", age: 21, group: 101 };
      mockRepository.findOne.mockResolvedValue({ ...existingStudent });
      mockRepository.save.mockResolvedValue(updatedStudent);

      const result = await service.updateStudent(1, { name: "John Updated", age: 21 });

      expect(result).toEqual(updatedStudent);
    });

    it("should return null if student not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.updateStudent(999, { name: "Test" });

      expect(result).toBeNull();
    });

    it("should throw error on failure", async () => {
      const existingStudent = { id: 1, name: "John", age: 20, group: 101 };
      mockRepository.findOne.mockResolvedValue(existingStudent);
      mockRepository.save.mockRejectedValue(new Error("DB error"));

      await expect(service.updateStudent(1, { name: "Updated" })).rejects.toThrow("Failed to update student");
    });
  });

  describe("deleteStudent", () => {
    it("should delete student", async () => {
      const student = { id: 1, name: "John", age: 20, group: 101 };
      mockRepository.findOne.mockResolvedValue(student);
      mockRepository.remove.mockResolvedValue(student);

      const result = await service.deleteStudent(1);

      expect(result).toEqual(student);
      expect(mockRepository.remove).toHaveBeenCalledWith(student);
    });

    it("should return null if student not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.deleteStudent(999);

      expect(result).toBeNull();
    });

    it("should throw error on failure", async () => {
      const student = { id: 1, name: "John", age: 20, group: 101 };
      mockRepository.findOne.mockResolvedValue(student);
      mockRepository.remove.mockRejectedValue(new Error("DB error"));

      await expect(service.deleteStudent(1)).rejects.toThrow("Failed to delete student");
    });
  });
});
