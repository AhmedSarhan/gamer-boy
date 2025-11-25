import { NextRequest, NextResponse } from "next/server";
import {
  AppError,
  InternalServerError,
  logError,
  type ErrorResponse,
} from "./errors";

/**
 * Type for API route handlers
 */
export type ApiHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

/**
 * Wraps an API handler with consistent error handling
 * Catches errors and returns standardized error responses
 */
export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Log the error
      const route = new URL(request.url).pathname;
      logError(error as Error, route);

      // Handle AppError (our custom errors)
      if (error instanceof AppError) {
        return NextResponse.json<ErrorResponse>(error.toJSON(), {
          status: error.statusCode,
        });
      }

      // Handle unexpected errors
      const internalError = new InternalServerError(
        "An unexpected error occurred",
        process.env.NODE_ENV === "development"
          ? { originalError: (error as Error).message }
          : undefined
      );

      return NextResponse.json<ErrorResponse>(internalError.toJSON(), {
        status: 500,
      });
    }
  };
}

/**
 * Helper to create success responses with consistent format
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse<T> {
  return NextResponse.json(data, {
    status,
    headers,
  });
}

/**
 * Helper to parse and validate query parameters
 */
export function getQueryParam(
  request: NextRequest,
  param: string,
  defaultValue?: string
): string | undefined {
  return request.nextUrl.searchParams.get(param) ?? defaultValue;
}

export function getQueryParamAsInt(
  request: NextRequest,
  param: string,
  defaultValue: number
): number {
  const value = request.nextUrl.searchParams.get(param);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function getQueryParamAsBoolean(
  request: NextRequest,
  param: string,
  defaultValue: boolean = false
): boolean {
  const value = request.nextUrl.searchParams.get(param);
  if (!value) return defaultValue;
  return value === "true" || value === "1";
}
