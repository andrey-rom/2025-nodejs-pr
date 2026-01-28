import { Request, Response } from "express";
import { StudentsService } from "../services/students.service";
import {
  StudentValidationSchema,
  StudentUpdateValidationSchema,
  IStudent,
  StudentId,
} from "../models/Student";

export class StudentsController {
  private studentsService: StudentsService;

  constructor() {
    this.studentsService = new StudentsService();
  }

  public getAllStudents = async (req: Request, res: Response) => {
    try {
      const students = await this.studentsService.getAllStudents();
      res.status(200).json(students);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to get students",
      });
    }
  };

  public getStudentById = async (req: Request, res: Response) => {
    try {
      const id: StudentId = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          error: "Invalid student id",
        });
      }

      const student = await this.studentsService.getStudentById(id);

      if (!student) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      res.status(200).json(student);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to get student",
      });
    }
  };

  public getStudentsByGroup = async (req: Request, res: Response) => {
    try {
      const group = Number(req.params.groupId);

      if (isNaN(group)) {
        return res.status(400).json({
          error: "Invalid group id",
        });
      }

      const students = await this.studentsService.getStudentsByGroup(group);

      if (students.length === 0) {
        return res.status(404).json({
          error: `No students found in group ${group}`,
        });
      }

      res.status(200).json(students);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to get students by group",
      });
    }
  };

  public calculateAverageAge = async (req: Request, res: Response) => {
    try {
      const averageAge = await this.studentsService.calculateAverageAge();
      res.status(200).json({
        averageAge: parseFloat(averageAge.toFixed(2)),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to calculate average age",
      });
    }
  };

  public addStudent = async (
    req: Request<{}, {}, IStudent>,
    res: Response
  ) => {
    try {
      const { error, value } = StudentValidationSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.details.map((item: any) => item.message),
        });
      }

      const newStudent = await this.studentsService.addStudent(
        value.name,
        value.age,
        value.group
      );

      res.status(201).json(newStudent);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to add student",
      });
    }
  };

  public updateStudent = async (req: Request, res: Response) => {
    try {
      const id: StudentId = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          error: "Invalid student id",
        });
      }

      const { error, value } = StudentUpdateValidationSchema.validate(
        req.body
      );

      if (error) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.details.map((item: any) => item.message),
        });
      }

      const student = await this.studentsService.getStudentById(id);
      if (!student) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      const updatedStudent = await this.studentsService.updateStudent(
        id,
        value
      );

      res.status(200).json(updatedStudent);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to update student",
      });
    }
  };

  public deleteStudent = async (req: Request, res: Response) => {
    try {
      const id: StudentId = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          error: "Invalid student id",
        });
      }

      const deletedStudent = await this.studentsService.deleteStudent(id);

      if (!deletedStudent) {
        return res.status(404).json({
          error: "Student not found",
        });
      }

      res.status(200).json({
        message: `Student with id ${id} deleted successfully`,
        student: deletedStudent,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to delete student",
      });
    }
  };
}
