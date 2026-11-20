import { beforeEach, describe, expect, it, vi } from "vitest";
import { APIClientError } from "@/lib/api/errors";

vi.mock("@/lib/auth/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/session")>();
  return { ...actual, getSession: vi.fn() };
});

vi.mock("@/lib/api/telemetryClient", () => ({
  telemetryClient: { getSeries: vi.fn() },
}));

const { getSession } = await import("@/lib/auth/session");
const { telemetryClient } = await import("@/lib/api/telemetryClient");
const { GET } = await import("./route");

function call(habitatId: string, query = "") {
  const request = new Request(
    `http://localhost/api/habitat/${habitatId}/telemetry/series${query}`,
  );
  const ctx = { params: Promise.resolve({ habitatId }) };
  return GET(request, ctx as Parameters<typeof GET>[1]);
}

const series = {
  habitatId: 1,
  metric: "vpd",
  bucket: "hour",
  from: "2026-11-18T15:00:00.000Z",
  to: "2026-11-19T15:00:00.000Z",
  tz: "America/Sao_Paulo",
  points: [],
};

describe("GET /api/habitat/:habitatId/telemetry/series", () => {
  beforeEach(() => {
    vi.mocked(getSession).mockReset().mockResolvedValue({ token: "tok" });
    vi.mocked(telemetryClient.getSeries).mockReset();
  });

  it("forwards from/to/tz/metric and never sends a bucket", async () => {
    vi.mocked(telemetryClient.getSeries).mockResolvedValue(
      series as Awaited<ReturnType<typeof telemetryClient.getSeries>>,
    );

    const response = await call("1", "?range=7d&tz=America/Sao_Paulo");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(series);
    const [token, habitatId, query] = vi.mocked(telemetryClient.getSeries)
      .mock.calls[0];
    expect(token).toBe("tok");
    expect(habitatId).toBe(1);
    expect(query).toMatchObject({ metric: "vpd", tz: "America/Sao_Paulo" });
    expect(query).not.toHaveProperty("bucket");
    expect(Date.parse(query.to) - Date.parse(query.from)).toBe(
      7 * 24 * 60 * 60 * 1000,
    );
  });

  it("rejects a non-numeric habitat ID", async () => {
    const response = await call("12abc");
    expect(response.status).toBe(400);
    expect(telemetryClient.getSeries).not.toHaveBeenCalled();
  });

  it("rejects an unknown range with Validation failed", async () => {
    const response = await call("1", "?range=1y");
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      message: "Validation failed",
    });
    expect(telemetryClient.getSeries).not.toHaveBeenCalled();
  });

  it("passes backend errors through with their status", async () => {
    vi.mocked(telemetryClient.getSeries).mockRejectedValue(
      new APIClientError(404, "Not Found", { message: "Habitat not found" }),
    );

    const response = await call("99");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      message: "Not Found",
      details: { message: "Habitat not found" },
    });
  });
});
