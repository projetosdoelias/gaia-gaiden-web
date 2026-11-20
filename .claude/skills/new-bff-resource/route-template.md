# Route handler template (Next 16, BFF)

Check `node_modules/next/dist/docs/` if anything here conflicts with the installed version.

```ts
// src/app/api/habitat/[habitatId]/<domain>/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { APIClientError } from "@/lib/api/errors";
import { exampleClient } from "@/lib/api/exampleClient";
import { idParamSchema, createExampleSchema } from "@/lib/schemas/example";

type Ctx = { params: Promise<{ habitatId: string }> };

function errorResponse(error: unknown, action: string) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { message: "Validation failed", details: error.issues },
      { status: 400 },
    );
  }
  if (error instanceof APIClientError) {
    return NextResponse.json(
      { message: error.message, details: error.details },
      { status: error.status },
    );
  }
  console.error(`Unexpected error ${action}:`, error); // never log tokens/session
  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session?.token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const habitatId = idParamSchema.safeParse((await params).habitatId);
    if (!habitatId.success) {
      return NextResponse.json({ message: "Invalid habitat ID" }, { status: 400 });
    }

    const input = createExampleSchema.parse(await request.json()); // .strict()
    const created = await exampleClient.create(session.token, habitatId.data, input);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return errorResponse(error, "creating example");
  }
}
```

Rules this template encodes:
- 401 before any other work.
- Strict ID validation (no `parseInt`).
- The body is whitelisted by Zod.
- Errors use `{ message, details }`.
- Backend status codes pass through.
- No domain logic.

Once a second resource uses `errorResponse`, extract it to `src/lib/api/routeErrors.ts`. Don't copy it a third time.
