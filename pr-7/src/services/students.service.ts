import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Student } from "../models/Student/Student.entity";
import { StudentId, IStudentUpdate } from "../models/Student";
import logger from "../utils/logger";

export class StudentsService {
  private studentRepository: Repository<Student>;

  constructor() {
    this.studentRepository = AppDataSource.getRepository(Student);
  }

  public async getAllStudents(): Promise<Student[]> {
    try {
      logger.debug("Fetching all students from database");
      const students = await this.studentRepository.find({
        order: {
          id: "ASC",
        },
      });
      logger.info(`Retrieved ${students.length} students`);
      return students;
    } catch (error) {
      logger.error("Error getting all students:", error);
      throw new Error("Failed to get all students");
    }
  }

  public async getStudentById(id: StudentId): Promise<Student | null> {
    try {
      return await this.studentRepository.findOne({
        where: { id },
      });
    } catch (error) {
      logger.error(`Error getting student by id ${id}:`, error);
      throw new Error("Failed to get student by id");
    }
  }

  public async getStudentsByGroup(group: number): Promise<Student[]> {
    try {
      return await this.studentRepository.find({
        where: { group },
        order: {
          id: "ASC",
        },
      });
    } catch (error) {
      logger.error(`Error getting students by group ${group}:`, error);
      throw new Error("Failed to get students by group");
    }
  }

  public async calculateAverageAge(): Promise<number> {
    try {
      const result = await this.studentRepository
        .createQueryBuilder("student")
        .select("AVG(student.age)", "avg")
        .getRawOne();

      return parseFloat(result?.avg || "0");
    } catch (error) {
      logger.error("Error calculating average age:", error);
      throw new Error("Failed to calculate average age");
    }
  }

  public async addStudent(
    name: string,
    age: number,
    group: number
  ): Promise<Student> {
    try {
      logger.info(`Adding new student: ${name}, age: ${age}, group: ${group}`);
      const student = this.studentRepository.create({
        name,
        age,
        group,
      });

      const savedStudent = await this.studentRepository.save(student);
      logger.info(`Student added successfully with ID: ${savedStudent.id}`);
      return savedStudent;
    } catch (error) {
      logger.error("Error adding student:", error);
      throw new Error("Failed to add student");
    }
  }

  public async updateStudent(
    id: StudentId,
    updates: IStudentUpdate
  ): Promise<Student | null> {
    try {
      logger.info(`Updating student with ID: ${id}`);
      logger.debug(`Update data: ${JSON.stringify(updates)}`);
      
      const student = await this.getStudentById(id);

      if (!student) {
        logger.warn(`Student with ID ${id} not found for update`);
        return null;
      }

      // update fields
      if (updates.name !== undefined) {
        student.name = updates.name;
      }
      if (updates.age !== undefined) {
        student.age = updates.age;
      }
      if (updates.group !== undefined) {
        student.group = updates.group;
      }

      const updatedStudent = await this.studentRepository.save(student);
      logger.info(`Student ${id} updated successfully`);
      return updatedStudent;
    } catch (error) {
      logger.error(`Error updating student ${id}:`, error);
      throw new Error("Failed to update student");
    }
  }

  public async deleteStudent(id: StudentId): Promise<Student | null> {
    try {
      logger.info(`Deleting student with ID: ${id}`);
      const student = await this.getStudentById(id);

      if (!student) {
        logger.warn(`Student with ID ${id} not found for deletion`);
        return null;
      }

      await this.studentRepository.remove(student);
      logger.info(`Student ${id} deleted successfully`);
      return student;
    } catch (error) {
      logger.error(`Error deleting student ${id}:`, error);
      throw new Error("Failed to delete student");
    }
  }
}
