import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { AppDataSource } from "./database/data-source";
import StudentsRouter from "./routes/students.router";

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

// Routes
app.use("/api/students", StudentsRouter);

// TypeORM connection and start server
AppDataSource.initialize()
  .then(() => {
    console.log(`Connected to database: ${process.env.PG_DATABASE_NAME}`);

    app.listen(PORT, () => {
      console.log(`API is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error", error);
    process.exit(1);
  });
