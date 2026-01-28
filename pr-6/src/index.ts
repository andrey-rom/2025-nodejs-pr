import "reflect-metadata";
import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import statusMonitor from "express-status-monitor";
import { AppDataSource } from "./database/data-source";
import StudentsRouter from "./routes/students.router";
import AuthRouter from "./routes/auth.router";
import { swaggerSpec } from "./swagger/swagger";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 3000;

// Status monitor for metrics
app.use(statusMonitor());

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

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.use("/api/auth", AuthRouter);
app.use("/api/students", StudentsRouter);


// TypeORM connection and start server
AppDataSource.initialize()
  .then(() => {
    logger.info(`Connected to database: ${process.env.PG_DATABASE_NAME}`);

    app.listen(PORT, () => {
      logger.info(`API is running on http://localhost:${PORT}`);
      logger.info(`Swagger docs: http://localhost:${PORT}/api-docs`);
      logger.info(`Status monitor: http://localhost:${PORT}/status`);
    });
  })
  .catch((error) => {
    logger.error("Database connection error", error);
    process.exit(1);
  });

export { app };
