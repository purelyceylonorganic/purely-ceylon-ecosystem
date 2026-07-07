import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

// 📂 Logs Directory
const logDirectory = path.join(process.cwd(), "logs");

// Folder இல்லையெனில் உருவாக்கு
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

export const logger = winston.createLogger({
  level:
    process.env.NODE_ENV === "production"
      ? "info"
      : "debug",

  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),

    winston.format.errors({
      stack: true,
    }),

    winston.format.json()
  ),

  defaultMeta: {
    service: "purely-ceylon-backend-ecosystem",
  },

  transports: [
    // 🔴 Error Logs
    new DailyRotateFile({
      filename: path.join(
        logDirectory,
        "error-%DATE%.log"
      ),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "30d",
    }),

    // 🟢 Combined Logs
    new DailyRotateFile({
      filename: path.join(
        logDirectory,
        "application-%DATE%.log"
      ),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});

// 💻 Development Console Logger
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),

        winston.format.printf(
          ({
            timestamp,
            level,
            message,
            service,
            ...rest
          }) => {
            const details =
              Object.keys(rest).length > 0
                ? JSON.stringify(rest)
                : "";

            return `[${timestamp}] [${level}] [${service}] ${message} ${details}`;
          }
        )
      ),
    })
  );
}

// 🌐 Production Console Logger
else {
  logger.add(
    new winston.transports.Console({
      format: winston.format.json(),
    })
  );
}