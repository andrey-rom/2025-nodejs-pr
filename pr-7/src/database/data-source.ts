import "reflect-metadata";
import { DataSource } from "typeorm";
import { Student } from "../models/Student/Student.entity";
import { User } from "../models/User/User.entity";
import { Role } from "../models/Role/Role.entity";
import { Subject } from "../models/Subject/Subject.entity";
import { Grade } from "../models/Grade/Grade.entity";
import { CreateStudentsTable1704000000000 } from "./migrations/1704000000000-CreateStudentsTable";
import { CreateRolesTable1704000000001 } from "./migrations/1704000000001-CreateRolesTable";
import { CreateUsersTable1704000000002 } from "./migrations/1704000000002-CreateUsersTable";
import { CreateSubjectsTable1704000000003 } from "./migrations/1704000000003-CreateSubjectsTable";
import { AddUserIdToStudents1704000000004 } from "./migrations/1704000000004-AddUserIdToStudents";
import { CreateGradesTable1704000000005 } from "./migrations/1704000000005-CreateGradesTable";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PG_HOST || "localhost",
  port: Number(process.env.PG_PORT) || 5432,
  username: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "1234",
  database: process.env.PG_DATABASE_NAME || "students_db",
  synchronize: false,
  logging: false,
  entities: [Student, User, Role, Subject, Grade],
  migrations: [
    CreateStudentsTable1704000000000,
    CreateRolesTable1704000000001,
    CreateUsersTable1704000000002,
    CreateSubjectsTable1704000000003,
    AddUserIdToStudents1704000000004,
    CreateGradesTable1704000000005,
  ],
  subscribers: [],
});
