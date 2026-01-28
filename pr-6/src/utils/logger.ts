import winston from "winston";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

const transports: winston.transport[] = [];

if (process.env.NODE_ENV === "production") {
  // Production: write to files
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      level: "info",
      format: logFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: logFormat,
    })
  );
} else {
  // Development: console only
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports,
});

export default logger;
