import { beforeEach, describe, expect, it, vi } from "vitest";
import { APIClientError } from "./errors";

vi.mock("@/lib/auth/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/session")>();
  return { ...actual, getSession: vi.fn() };
});

const { getSession } = await import("@/lib/auth/session");
const { withSession } = await import("./withSession");

const request = new Request("http://localhost/api/habitat");

function sessionCookie(response: Response) {
  return response.headers.get("set-cookie") ?? "";
}

describe("withSession", () => {
  beforeEach(() => {
    vi.mocked(getSession).mockReset();
  });

  it("clears the cookie and returns SESSION_EXPIRED on an upstream 401", async () => {
    vi.mocked(getSession).mockResolvedValue({ token: "expired" });
    const handler = withSession("testing", async () => {
      throw new APIClientError(401, "Unauthorized");
    });

    const response = await handler(request, undefined);

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ code: "SESSION_EXPIRED" });
    expect(sessionCookie(response)).toMatch(/gaia_session=;/);
    expect(sessionCookie(response)).toMatch(/Max-Age=0/i);
  });

  it("returns 401 without calling the handler when there is no session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const inner = vi.fn();
    const handler = withSession("testing", inner);

    const response = await handler(request, undefined);

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ code: "UNAUTHENTICATED" });
    expect(inner).not.toHaveBeenCalled();
  });

  it("passes the token to the handler", async () => {
    vi.mocked(getSession).mockResolvedValue({ token: "abc" });
    const handler = withSession("testing", async ({ token }) =>
      Response.json({ token }),
    );

    const response = await handler(request, undefined);
    expect(await response.json()).toEqual({ token: "abc" });
  });

  it("maps other backend errors through errorResponse, keeping the cookie", async () => {
    vi.mocked(getSession).mockResolvedValue({ token: "abc" });
    const handler = withSession("testing", async () => {
      throw new APIClientError(403, "Forbidden", { reason: "not owner" });
    });

    const response = await handler(request, undefined);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      message: "Forbidden",
      details: { reason: "not owner" },
    });
    expect(sessionCookie(response)).toBe("");
  });
});
