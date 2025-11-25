/**
 * Request validation schemas using Zod
 */

import { z } from "zod";
import { NextRequest } from "next/server";
import { ValidationError } from "./errors";

/**
 * Schema for games list query parameters
 */
export const gamesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().min(1).optional(),
  categories: z.string().optional(),
});

/**
 * Schema for games by IDs query parameters
 */
export const gamesByIdsQuerySchema = z.object({
  ids: z.string().min(1, "IDs parameter is required"),
});

/**
 * Schema for ratings query parameters (GET)
 */
export const ratingsQuerySchema = z.object({
  fingerprint: z.string().optional(),
});

/**
 * Schema for submitting a rating (POST)
 */
export const submitRatingSchema = z.object({
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  fingerprint: z.string().min(1, "User fingerprint is required"),
});

/**
 * Schema for route parameters with gameId
 */
export const gameIdParamSchema = z.object({
  gameId: z.string().regex(/^\d+$/, "Game ID must be a valid number"),
});

/**
 * Helper to validate query parameters from a NextRequest
 */
export function validateQueryParams<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  const params: Record<string, string> = {};

  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);

  if (!result.success) {
    throw new ValidationError("Invalid query parameters", {
      errors: result.error.issues,
    });
  }

  return result.data;
}

/**
 * Helper to validate request body from a NextRequest
 */
export async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new ValidationError("Invalid request body", {
        errors: result.error.issues,
      });
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Invalid JSON in request body");
  }
}

/**
 * Helper to validate route parameters
 */
export function validateParams<T extends z.ZodType>(
  params: Record<string, string>,
  schema: T
): z.infer<T> {
  const result = schema.safeParse(params);

  if (!result.success) {
    throw new ValidationError("Invalid route parameters", {
      errors: result.error.issues,
    });
  }

  return result.data;
}
