/**
 * Standardized error handling for API routes
 */

import { logger } from "./logger";

export enum ErrorCode {
  // Client errors (400-499)
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // Server errors (500-599)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
}

export interface ErrorResponse {
  error: string;
  code: ErrorCode;
  message: string;
  details?: unknown;
  timestamp: string;
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorResponse {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

// Convenience error classes
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", details?: unknown) {
    super(ErrorCode.BAD_REQUEST, message, 400, details);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details?: unknown) {
    super(ErrorCode.NOT_FOUND, message, 404, details);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details?: unknown) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details);
    this.name = "ValidationError";
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string = "Database operation failed",
    details?: unknown
  ) {
    super(ErrorCode.DATABASE_ERROR, message, 500, details);
    this.name = "DatabaseError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", details?: unknown) {
    super(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details);
    this.name = "InternalServerError";
  }
}

// Error logging utility
export function logError(error: Error | AppError, context?: string): void {
  if (error instanceof AppError) {
    logger.error(context ? `[${context}] ${error.name}` : error.name, error, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    });
  } else {
    logger.error(context ? `[${context}] Error` : "Error", error);
  }
}
