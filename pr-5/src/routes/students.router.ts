import { Router } from "express";
import { StudentsController } from "../controllers/students.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly, adminOrTeacher, authenticated } from "../middleware/role.middleware";

const router = Router();
const studentsController = new StudentsController();

// All routes require authentication
router.use(authMiddleware);

// GET /api/students  get all students (accessible by all authenticated users)
router.get("/", authenticated, studentsController.getAllStudents);

// GET /api/students/average-age  calculate average age (accessible by admin and teacher)
router.get("/average-age", adminOrTeacher, studentsController.calculateAverageAge);

// GET /api/students/group/:groupId  get students by group (accessible by admin and teacher)
router.get("/group/:groupId", adminOrTeacher, studentsController.getStudentsByGroup);

// GET /api/students/:id  get student by ID (accessible by all authenticated users)
router.get("/:id", authenticated, studentsController.getStudentById);

// POST /api/students  add new student (admin and teacher only)
router.post("/", adminOrTeacher, studentsController.addStudent);

// PUT /api/students/:id  update student by ID (admin and teacher only)
router.put("/:id", adminOrTeacher, studentsController.updateStudent);

// DELETE /api/students/:id  delete student by ID (admin only)
router.delete("/:id", adminOnly, studentsController.deleteStudent);

export default router;
