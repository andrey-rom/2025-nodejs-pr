import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { AppDataSource } from "./database/data-source";
import StudentsRouter from "./routes/students.router";
import AuthRouter from "./routes/auth.router";

const app = express();
const PORT = process.env.PORT || 3000;

// allow Authorization header
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Expose-Headers", "Authorization");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());

// routes
app.use("/api/auth", AuthRouter);
app.use("/api/students", StudentsRouter);


// TypeORM connection and start server
AppDataSource.initialize()
  .then(() => {
    console.log(`Connected to database: ${process.env.PG_DATABASE_NAME}`);

    app.listen(PORT, () => {
      console.log(`API is running on http://localhost:${PORT}`);
      console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`Students endpoints: http://localhost:${PORT}/api/students`);
    });
  })
  .catch((error) => {
    console.error("Error", error);
    process.exit(1);
  });
