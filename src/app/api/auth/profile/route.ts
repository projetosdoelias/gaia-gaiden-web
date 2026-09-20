import { getSession, clearSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Return user data stored in the session (fetched during login)
    if (!session.user) {
      return NextResponse.json(
        { message: "User data not found in session" },
        { status: 404 },
      );
    }

    return NextResponse.json(session.user);
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}