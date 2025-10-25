/**
 * 📝 LOGGING SYSTEM
 * Structured logging with Winston
 */

import winston from "winston";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

/**
 * Custom log format
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }

    return logMessage;
  })
);

/**
 * Create Winston logger
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: customFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Performance log file
    new winston.transports.File({
      filename: path.join(logDir, "performance.log"),
      level: "info",
      maxsize: 5242880,
      maxFiles: 3,
    }),
  ],
  exitOnError: false,
});

/**
 * Log levels:
 * - error: Error events that might still allow the application to continue running
 * - warn: Warning events
 * - info: Informational messages that highlight progress
 * - http: HTTP request/response logs
 * - debug: Detailed information for debugging
 */

export default logger;
export { logger };

/**
 * Log info message
 */
export function logInfo(message: string, meta?: Record<string, any>): void {
  logger.info(message, meta);
}

/**
 * Log error message
 */
export function logError(
  message: string,
  error?: Error,
  meta?: Record<string, any>
): void {
  logger.error(message, {
    error: error?.message,
    stack: error?.stack,
    ...meta,
  });
}

/**
 * Log warning message
 */
export function logWarning(message: string, meta?: Record<string, any>): void {
  logger.warn(message, meta);
}

/**
 * Log debug message
 */
export function logDebug(message: string, meta?: Record<string, any>): void {
  logger.debug(message, meta);
}

/**
 * Log HTTP request
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  meta?: Record<string, any>
): void {
  logger.http(`${method} ${url} ${statusCode} - ${duration}ms`, meta);
}

/**
 * Log database query
 */
export function logQuery(
  query: string,
  duration: number,
  meta?: Record<string, any>
): void {
  logger.debug(`DB Query: ${query} - ${duration}ms`, meta);
}

/**
 * Log API call
 */
export function logApiCall(
  service: string,
  endpoint: string,
  duration: number,
  success: boolean,
  meta?: Record<string, any>
): void {
  const level = success ? "info" : "error";
  logger.log(
    level,
    `API Call: ${service} ${endpoint} - ${duration}ms - ${
      success ? "SUCCESS" : "FAILED"
    }`,
    meta
  );
}

/**
 * Log user action
 */
export function logUserAction(
  userId: string,
  action: string,
  meta?: Record<string, any>
): void {
  logger.info(`User Action: ${userId} - ${action}`, meta);
}

/**
 * Log authentication event
 */
export function logAuth(
  event: "login" | "logout" | "register" | "failed_login",
  userId?: string,
  meta?: Record<string, any>
): void {
  logger.info(`Auth: ${event}${userId ? ` - User: ${userId}` : ""}`, meta);
}

/**
 * Log payment event
 */
export function logPayment(
  userId: string,
  amount: number,
  status: "success" | "failed" | "pending",
  meta?: Record<string, any>
): void {
  logger.info(`Payment: ${userId} - R${amount} - ${status}`, meta);
}

/**
 * Log system event
 */
export function logSystem(
  event: string,
  status: "started" | "stopped" | "error",
  meta?: Record<string, any>
): void {
  const level = status === "error" ? "error" : "info";
  logger.log(level, `System: ${event} - ${status}`, meta);
}

/**
 * Log performance metric
 */
export function logPerformance(
  metric: string,
  value: number,
  unit: string,
  meta?: Record<string, any>
): void {
  logger.info(`Performance: ${metric} = ${value}${unit}`, meta);
}

/**
 * Log security event
 */
export function logSecurity(
  event: string,
  severity: "low" | "medium" | "high" | "critical",
  meta?: Record<string, any>
): void {
  const level =
    severity === "critical" || severity === "high" ? "error" : "warn";
  logger.log(level, `Security: [${severity.toUpperCase()}] ${event}`, meta);
}

/**
 * Log cache event
 */
export function logCache(
  operation: "hit" | "miss" | "set" | "delete",
  key: string,
  meta?: Record<string, any>
): void {
  logger.debug(`Cache: ${operation.toUpperCase()} - ${key}`, meta);
}

/**
 * Log queue event
 */
export function logQueue(
  queue: string,
  event: "added" | "completed" | "failed" | "stalled",
  jobId: string,
  meta?: Record<string, any>
): void {
  const level = event === "failed" ? "error" : "info";
  logger.log(level, `Queue: ${queue} - ${event} - Job ${jobId}`, meta);
}

/**
 * Create child logger with default metadata
 */
export function createChildLogger(
  defaultMeta: Record<string, any>
): winston.Logger {
  return logger.child(defaultMeta);
}

/**
 * Stream for HTTP request logging (Morgan compatible)
 */
export const httpStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
