import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const loginSchema = z.object({
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    });

    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // TODO: Implement actual authentication logic here
    // Example: Check credentials against database
    // const user = await authenticateUser(validatedData.username, validatedData.password);
    // if (!user) {
    //   return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    // }

    // TODO: Set HTTP-only cookie with token
    // const token = generateAuthToken(user);
    // const response = NextResponse.json({ message: "Login successful" });
    // response.cookies.set({
    //   name: "auth_token",
    //   value: token,
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   path: "/",
    // });
    // return response;

    // Forward request to external backend
    const backendResponse = await fetch(
      `${process.env.GAIA_GARDEN_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      },
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(errorData.message || "Login failed");
    }

    const { token } = await backendResponse.json();

    // Set secure HTTP-only cookie
    const nextResponse = NextResponse.json({ message: "Login successful" });
    nextResponse.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return nextResponse;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: err.issues,
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
