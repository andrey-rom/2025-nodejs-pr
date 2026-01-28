import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Student } from "../Student/Student.entity";
import { Subject } from "../Subject/Subject.entity";

@Entity("grades")
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.grades)
  @JoinColumn({ name: "student_id" })
  student: Student;

  @Column({ name: "student_id" })
  studentId: number;

  @ManyToOne(() => Subject, (subject) => subject.grades, { eager: true })
  @JoinColumn({ name: "subject_id" })
  subject: Subject;

  @Column({ name: "subject_id" })
  subjectId: number;

  @Column({ type: "decimal", precision: 3, scale: 1 })
  grade: number;

  @Column({ type: "timestamp", name: "evaluated_at", nullable: true })
  evaluatedAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
