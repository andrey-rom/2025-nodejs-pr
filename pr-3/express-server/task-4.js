const express = require("express");
const path = require("path");
const { StudentsStorage } = require("../previous-task/StudentsStorage");
const { saveToJSON, loadJSON } = require("../previous-task/utils");
const { Backup } = require("../previous-task/Backup");

const app = express();
const PORT = 3000;
const STUDENTS_FILE = path.join(__dirname, "students.json");

// enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// enable JSON request parsing middleware
app.use(express.json());

const storage = new StudentsStorage();
const backup = new Backup(path.join(__dirname, "backups"));

// GET /api/students get all students
app.get("/api/students", (req, res) => {
  try {
    const students = storage.getAllStudents();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// GET /api/students/average-age calculate average age
app.get("/api/students/average-age", (req, res) => {
  try {
    const averageAge = storage.calculateAverageAge();
    res.status(200).json({
      averageAge,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// GET /api/students/group/:id get students by group
app.get("/api/students/group/:id", (req, res) => {
  try {
    const group = Number(req.params.id);
    const students = storage.getStudentsByGroup(group);
    if (!students || students.length === 0) {
      return res.status(404).json({
        error: `no students found in ${group} group  `,
      });
    }
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// GET /api/students/:id get student by ID
app.get("/api/students/:id", (req, res) => {
  try {
    const student = storage.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// POST /api/students add new student
app.post("/api/students", (req, res) => {
  try {
    const { name, age, group } = req.body;
    if (!name || !age || !group) {
      return res.status(400).json({
        error: "Missing fields: name, age and group",
      });
    }
    const newStudent = storage.addStudent(name, age, group);
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// PUT /api/students replace entire students collection
app.put("/api/students", (req, res) => {
  try {
    const newStudents = req.body;
    if (!Array.isArray(newStudents)) {
      return res.status(400).json({
        error: "Expected an array of students",
      });
    }
    storage.replaceAll(newStudents);
    res.status(200).json({
      message: "Collection replaced",
      students: storage.getAllStudents(),
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// PUT /api/students/:id update student by ID
app.put("/api/students/:id", (req, res) => {
  try {
    const { name, age, group } = req.body;
    const student = storage.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }
    if (name !== undefined) student.name = name;
    if (age !== undefined) student.age = age;
    if (group !== undefined) student.group = group;
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// DELETE /api/students/:id remove student by ID
app.delete("/api/students/:id", (req, res) => {
  try {
    const removedStudent = storage.removeStudent(req.params.id);
    res.status(200).json({
      message: `Student with id ${removedStudent.id} deleted successfully`,
      student: removedStudent,
    });
  } catch (err) {
    return res.status(404).json({
      error: err.message,
    });
  }
});

// POST /api/students/save save students to JSON file
app.post("/api/students/save", async (req, res) => {
  try {
    const students = storage.getAllStudents();
    await saveToJSON(students, STUDENTS_FILE);
    res.status(200).json({
      message: "students saved successfully",
      file: STUDENTS_FILE,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// POST /api/students/load load students from file
app.post("/api/students/load", async (req, res) => {
  try {
    const students = await loadJSON(STUDENTS_FILE);

    if (!students) {
      return res.status(404).json({
        error: "students file not found",
      });
    }
    storage.replaceAll(students);
    res.status(200).json({
      message: "students loaded successfully",
      count: students.length,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// POST /api/backup/start start backup mechanism
app.post("/api/backup/start", (req, res) => {
  try {
    const { intervalMs = 10000 } = req.body;
    
    if (backup.interval) {
      return res.status(400).json({
        error: "backup already running",
      });
    }
    
    backup.start(() => storage.getAllStudents(), intervalMs);
    res.status(200).json({
      message: "backup started",
      intervalMs,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// POST /api/backup/stop stop backup mechanism
app.post("/api/backup/stop", (req, res) => {
  try {
    if (!backup.interval) {
      return res.status(400).json({
        error: "backup not running",
      });
    }
    
    backup.stop();
    res.status(200).json({
      message: "backup stopped",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// GET /api/backup/status return current status
app.get("/api/backup/status", (req, res) => {
  try {
    const isRunning = backup.interval !== null;
    res.status(200).json({
      status: isRunning ? "running" : "stopped",
      isRunning,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`student api is running on http://localhost:${PORT}`);
});
