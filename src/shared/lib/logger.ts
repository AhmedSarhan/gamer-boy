/**
 * Professional logging service with structured logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.level = this.getLogLevelFromEnv();
  }

  /**
   * Get log level from environment variable
   */
  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();

    switch (envLevel) {
      case "debug":
        return LogLevel.DEBUG;
      case "info":
        return LogLevel.INFO;
      case "warn":
        return LogLevel.WARN;
      case "error":
        return LogLevel.ERROR;
      case "none":
        return LogLevel.NONE;
      default:
        return this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Human-readable format for development
      let output = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;

      if (entry.context && Object.keys(entry.context).length > 0) {
        output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
      }

      if (entry.error) {
        output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
        if (entry.error.stack) {
          output += `\n  Stack: ${entry.error.stack}`;
        }
      }

      return output;
    } else {
      // JSON format for production (easier to parse by log aggregators)
      return JSON.stringify(entry);
    }
  }

  /**
   * Create log entry object
   */
  private createLogEntry(
    level: string,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  /**
   * Write log to output
   */
  private write(entry: LogEntry, consoleMethod: typeof console.log) {
    const formatted = this.formatLogEntry(entry);
    consoleMethod(formatted);
  }

  /**
   * Debug level logging - verbose information for debugging
   */
  debug(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.DEBUG) {
      const entry = this.createLogEntry("debug", message, context);
      this.write(entry, console.debug);
    }
  }

  /**
   * Info level logging - general informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.INFO) {
      const entry = this.createLogEntry("info", message, context);
      this.write(entry, console.info);
    }
  }

  /**
   * Warn level logging - warning messages that need attention
   */
  warn(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.WARN) {
      const entry = this.createLogEntry("warn", message, context);
      this.write(entry, console.warn);
    }
  }

  /**
   * Error level logging - error messages
   */
  error(
    message: string,
    errorOrContext?: Error | LogContext,
    context?: LogContext
  ): void {
    if (this.level <= LogLevel.ERROR) {
      let error: Error | undefined;
      let ctx: LogContext | undefined;

      // Handle overloaded parameters
      if (errorOrContext instanceof Error) {
        error = errorOrContext;
        ctx = context;
      } else {
        ctx = errorOrContext;
      }

      const entry = this.createLogEntry("error", message, ctx, error);
      this.write(entry, console.error);
    }
  }

  /**
   * Log HTTP request
   */
  http(
    method: string,
    path: string,
    statusCode: number,
    duration?: number
  ): void {
    if (this.level <= LogLevel.INFO) {
      const entry = this.createLogEntry("http", `${method} ${path}`, {
        method,
        path,
        statusCode,
        duration: duration ? `${duration}ms` : undefined,
      });
      this.write(entry, console.info);
    }
  }

  /**
   * Log database query
   */
  query(query: string, duration?: number, context?: LogContext): void {
    if (this.level <= LogLevel.DEBUG) {
      const entry = this.createLogEntry("query", query, {
        ...context,
        duration: duration ? `${duration}ms` : undefined,
      });
      this.write(entry, console.debug);
    }
  }

  /**
   * Set log level programmatically
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions for backwards compatibility
export const log = {
  debug: (message: string, context?: LogContext) =>
    logger.debug(message, context),
  info: (message: string, context?: LogContext) =>
    logger.info(message, context),
  warn: (message: string, context?: LogContext) =>
    logger.warn(message, context),
  error: (
    message: string,
    errorOrContext?: Error | LogContext,
    context?: LogContext
  ) => logger.error(message, errorOrContext, context),
  http: (method: string, path: string, statusCode: number, duration?: number) =>
    logger.http(method, path, statusCode, duration),
  query: (query: string, duration?: number, context?: LogContext) =>
    logger.query(query, duration, context),
};
