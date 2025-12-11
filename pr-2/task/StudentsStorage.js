const EventEmitter = require('events');
const { Student } = require('./Student');
const { STUDENT_EVENTS } = require('./events');

class StudentsStorage extends EventEmitter {
  #students = [
    new Student('1', 'John Doe', 21, 2),
    new Student('2', 'Jane Doe', 25, 3),
    new Student('3', 'Andrei Ramanenka', 24, 3),
  ];

  constructor() {
    super();
  }

  #getLastId() {
    if (this.#students.length === 0) return 0;
    const lastId = this.#students[this.#students.length - 1].id;
    return Number(lastId);
  }

  addStudent(name, age, group) {
    const lastId = this.#getLastId();
    const newId = String(lastId + 1);
    const newStudent = new Student(newId, name, age, group);

    this.#students.push(newStudent);
    this.emit(STUDENT_EVENTS.ADDED, newStudent);

    return newStudent;
  }

  removeStudent(id) {
    const student = this.#students.find((item) => item.id === id);
    if (!student) {
      const error = new Error(`Student with id ${id} not found`);
      this.emit(STUDENT_EVENTS.REMOVAL_FAILED, id, error);
      throw error;
    }

    this.#students = this.#students.filter((item) => item.id !== id);
    this.emit(STUDENT_EVENTS.REMOVED, student);
    return student;
  }

  getStudentById(id) {
    const student = this.#students.find((item) => item.id === id) || null;
    this.emit(STUDENT_EVENTS.RETRIEVED, { id, student });
    return student;
  }

  getStudentsByGroup(group) {
    const students = this.#students.filter((item) => item.group === group);
    this.emit(STUDENT_EVENTS.BY_GROUP_RETRIEVED, { group, students });
    return students;
  }

  getAllStudents() {
    this.emit(STUDENT_EVENTS.ALL_RETRIEVED, this.#students);
    return this.#students;
  }

  calculateAverageAge() {
    if (this.#students.length === 0) {
      this.emit(STUDENT_EVENTS.AVERAGE_AGE_CALCULATED, 0);
      return 0;
    }
    const averageAge =
      this.#students.reduce((acc, student) => acc + student.age, 0) /
      this.#students.length;

    this.emit(STUDENT_EVENTS.AVERAGE_AGE_CALCULATED, averageAge);
    return averageAge;
  }
}

module.exports = { StudentsStorage };
