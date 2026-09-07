import { setSession, type SessionData } from "@/lib/auth/session";
import { authClient } from "@/lib/api/authClient";
import { APIClientError } from "@/lib/api/errors";
import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    // Call NestJS authentication endpoint via authClient
    const result = await authClient.login({
      username: validated.username,
      password: validated.password,
    });
    console.log("Login result:", result);

    // NestJS returns { access_token: string }
    const accessToken = result.access_token as string | undefined;
    if (!accessToken) {
      throw new Error("Authentication succeeded but no access_token was returned");
    }

    const sessionData: SessionData = {
      token: accessToken,
      user: {
        id: "",
        email: "",
      },
    };

    // Set HttpOnly cookie
    const nextResponse = NextResponse.json({
      success: true,
      user: sessionData.user,
    });

    await setSession(sessionData, nextResponse);

    return nextResponse;
  } catch (error) {
    let status = 500;
    let message = "Internal server error";

    if (error instanceof z.ZodError) {
      status = 400;
      message = "Validation failed";
      return NextResponse.json({ message, errors: error.issues }, { status });
    } else if (error instanceof APIClientError) {
      status = error.status;
      message = error.message;
    }

    return NextResponse.json({ success: false, error: message }, { status });
  }
}
