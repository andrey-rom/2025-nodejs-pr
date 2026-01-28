import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "../User/User.entity";
import { Grade } from "../Grade/Grade.entity";

@Entity("students")
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "int" })
  age: number;

  @Column({ type: "int" })
  group: number;

  @OneToOne(() => User, (user) => user.student, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id", type: "uuid", nullable: true })
  userId: string;

  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
