import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Grade } from "../Grade/Grade.entity";

@Entity("subjects")
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, name: "subject_name" })
  subjectName: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @OneToMany(() => Grade, (grade) => grade.subject)
  grades: Grade[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
