import { Router } from "express";
import { StudentsController } from "../controllers/students.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly, adminOrTeacher, authenticated } from "../middleware/role.middleware";

const router = Router();
const studentsController = new StudentsController();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticated, studentsController.getAllStudents);

/**
 * @swagger
 * /api/students/average-age:
 *   get:
 *     summary: Calculate average age of students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Average age
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageAge:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin or teacher only)
 */
router.get("/average-age", adminOrTeacher, studentsController.calculateAverageAge);

/**
 * @swagger
 * /api/students/group/{groupId}:
 *   get:
 *     summary: Get students by group
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     responses:
 *       200:
 *         description: List of students in group
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       404:
 *         description: No students found in group
 */
router.get("/group/:groupId", adminOrTeacher, studentsController.getStudentsByGroup);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 */
router.get("/:id", authenticated, studentsController.getStudentById);

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Add new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentInput'
 *     responses:
 *       201:
 *         description: Student created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Forbidden (admin or teacher only)
 */
router.post("/", adminOrTeacher, studentsController.addStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentUpdate'
 *     responses:
 *       200:
 *         description: Student updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 */
router.put("/:id", adminOrTeacher, studentsController.updateStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student deleted
 *       404:
 *         description: Student not found
 *       403:
 *         description: Forbidden (admin only)
 */
router.delete("/:id", adminOnly, studentsController.deleteStudent);

export default router;
