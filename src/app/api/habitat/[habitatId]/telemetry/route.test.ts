import { beforeEach, describe, expect, it, vi } from "vitest";
import { APIClientError } from "@/lib/api/errors";

vi.mock("@/lib/auth/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/session")>();
  return { ...actual, getSession: vi.fn() };
});

vi.mock("@/lib/api/telemetryClient", () => ({
  telemetryClient: { create: vi.fn() },
}));

const { getSession } = await import("@/lib/auth/session");
const { telemetryClient } = await import("@/lib/api/telemetryClient");
const { POST } = await import("./route");

function call(habitatId: string, body: unknown) {
  const request = new Request(
    `http://localhost/api/habitat/${habitatId}/telemetry`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    },
  );
  const ctx = { params: Promise.resolve({ habitatId }) };
  return POST(request, ctx as Parameters<typeof POST>[1]);
}

const created = {
  id: 10,
  habitatId: 1,
  temperature: 26.5,
  humidity: 65.5,
  vpd: 1.2,
  recordedAt: "2026-11-26T12:00:00.000Z",
  createdAt: "2026-11-26T12:00:00.000Z",
};

describe("POST /api/habitat/:habitatId/telemetry", () => {
  beforeEach(() => {
    vi.mocked(getSession).mockReset().mockResolvedValue({ token: "tok" });
    vi.mocked(telemetryClient.create).mockReset();
  });

  it("forwards the reading with the session token and the param habitat", async () => {
    vi.mocked(telemetryClient.create).mockResolvedValue(created);

    const response = await call("1", { temperature: 26.5, humidity: 65.5 });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(created);
    expect(telemetryClient.create).toHaveBeenCalledWith("tok", 1, {
      temperature: 26.5,
      humidity: 65.5,
    });
  });

  it("returns 401 without a session and never calls the backend", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const response = await call("1", { temperature: 26.5, humidity: 65.5 });

    expect(response.status).toBe(401);
    expect(telemetryClient.create).not.toHaveBeenCalled();
  });

  it("rejects a non-numeric habitat ID", async () => {
    const response = await call("12abc", { temperature: 26.5, humidity: 65.5 });
    expect(response.status).toBe(400);
    expect(telemetryClient.create).not.toHaveBeenCalled();
  });

  it.each([
    ["a habitatId in the body", { temperature: 1, humidity: 2, habitatId: 2 }],
    ["a vpd in the body", { temperature: 1, humidity: 2, vpd: 9 }],
    ["a string reading", { temperature: "26.5", humidity: 65.5 }],
    ["a missing reading", { temperature: 26.5 }],
  ])("rejects %s with Validation failed", async (_, body) => {
    const response = await call("1", body);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      message: "Validation failed",
    });
    expect(telemetryClient.create).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const response = await call("1", "{not json");
    expect(response.status).toBe(400);
    expect(telemetryClient.create).not.toHaveBeenCalled();
  });

  it("passes a backend 404 (habitat not owned) through", async () => {
    vi.mocked(telemetryClient.create).mockRejectedValue(
      new APIClientError(404, "Not Found", { message: "Habitat not found" }),
    );

    const response = await call("99", { temperature: 26.5, humidity: 65.5 });

    expect(response.status).toBe(404);
  });
});
