import "reflect-metadata";
import { DataSource } from "typeorm";
import { Student } from "../models/Student/Student.entity";
import { CreateStudentsTable1704000000000 } from "./migrations/1704000000000-CreateStudentsTable";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PG_HOST || "localhost",
  port: Number(process.env.PG_PORT) || 5432,
  username: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "1234",
  database: process.env.PG_DATABASE_NAME || "students_db",
  synchronize: false,
  logging: false,
  entities: [Student],
  migrations: [CreateStudentsTable1704000000000],
  subscribers: [],
});
