import { NextResponse } from "next/server";
import { z } from "zod";
import { APIClientError } from "./errors";

/**
 * Shared error mapping for BFF route handlers.
 * - ZodError       → 400 { message: "Validation failed", details }
 * - APIClientError → { message, details } with the backend status
 * - anything else  → 500 (logged without tokens or session data)
 */
export function errorResponse(error: unknown, action: string) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { message: "Validation failed", details: error.issues },
      { status: 400 },
    );
  }
  if (error instanceof SyntaxError) {
    // Malformed JSON body
    return NextResponse.json(
      { message: "Validation failed", details: [{ message: "Invalid JSON body" }] },
      { status: 400 },
    );
  }
  if (error instanceof APIClientError) {
    return NextResponse.json(
      { message: error.message, details: error.details },
      { status: error.status },
    );
  }
  console.error(`Unexpected error ${action}:`, error);
  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 },
  );
}
