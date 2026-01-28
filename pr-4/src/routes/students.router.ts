import { Router } from "express";
import { StudentsController } from "../controllers/students.controller";

const router = Router();
const studentsController = new StudentsController();

// GET /api/students  get all students
router.get("/", studentsController.getAllStudents);

// GET /api/students/averageage  calculate average age
router.get("/average-age", studentsController.calculateAverageAge);

// GET /api/students/group/:groupId  get students by group
router.get("/group/:groupId", studentsController.getStudentsByGroup);

// GET /api/students/:id  get student by ID
router.get("/:id", studentsController.getStudentById);

// POST /api/students  add new student
router.post("/", studentsController.addStudent);

// PUT /api/students/:id  update student by ID
router.put("/:id", studentsController.updateStudent);

// DELETE /api/students/:id  delete student by ID
router.delete("/:id", studentsController.deleteStudent);

export default router;
