import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetSessionEndForTests,
  api,
  ApiError,
  apiJson,
  ForbiddenError,
  SessionExpiredError,
} from "./clientFetch";

function jsonResponse(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const assign = vi.fn();
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  __resetSessionEndForTests();
  assign.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("window", {
    location: { pathname: "/events", search: "?tab=open", assign },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const logoutCalls = () =>
  fetchMock.mock.calls.filter(([url]) => url === "/api/auth/logout");

describe("clientFetch", () => {
  it("runs the session-end routine once for concurrent 401s", async () => {
    fetchMock.mockImplementation(async (input) =>
      input === "/api/auth/logout"
        ? jsonResponse(200, { success: true })
        : jsonResponse(401, { code: "SESSION_EXPIRED" }),
    );

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () => apiJson("/api/habitat")),
    );

    for (const r of results) {
      expect(r.status).toBe("rejected");
      expect((r as PromiseRejectedResult).reason).toBeInstanceOf(
        SessionExpiredError,
      );
    }

    await vi.waitFor(() => expect(assign).toHaveBeenCalledTimes(1));
    expect(logoutCalls()).toHaveLength(1);
    expect(assign).toHaveBeenCalledWith(
      "/login?redirect=%2Fevents%3Ftab%3Dopen&reason=session_expired",
    );
  });

  it("still redirects when the logout call fails", async () => {
    fetchMock.mockImplementation(async (input) => {
      if (input === "/api/auth/logout") throw new TypeError("network down");
      return jsonResponse(401);
    });

    await expect(api("/api/habitat")).rejects.toBeInstanceOf(
      SessionExpiredError,
    );
    await vi.waitFor(() => expect(assign).toHaveBeenCalledTimes(1));
  });

  it("throws ForbiddenError on 403 without logging out", async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, { message: "Not yours" }));

    const error = await apiJson("/api/habitat/1/plants").catch((e) => e);

    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error).toMatchObject({ status: 403, message: "Not yours" });
    expect(logoutCalls()).toHaveLength(0);
    expect(assign).not.toHaveBeenCalled();
  });

  it.each([400, 404, 500])("throws ApiError with status %i", async (status) => {
    fetchMock.mockResolvedValue(jsonResponse(status, { message: "boom" }));

    const error = await apiJson("/api/habitat").catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).not.toBeInstanceOf(ForbiddenError);
    expect(error).toMatchObject({ status, message: "boom" });
    expect(assign).not.toHaveBeenCalled();
  });

  it("api returns non-ok responses (e.g. 404) to the caller", async () => {
    fetchMock.mockResolvedValue(jsonResponse(404));
    const response = await api("/api/habitat/1/plants/9");
    expect(response.status).toBe(404);
  });
});
