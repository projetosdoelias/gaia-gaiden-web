import { withSession } from "@/lib/api/withSession";
import { NextResponse } from "next/server";

export const GET = withSession("fetching profile", async ({ session }) => {
  // Return user data stored in the session (fetched during login)
  if (!session.user) {
    return NextResponse.json(
      { message: "User data not found in session" },
      { status: 404 },
    );
  }

  return NextResponse.json(session.user);
});
