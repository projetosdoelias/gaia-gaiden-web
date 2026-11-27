import { describe, expect, it } from "vitest";
import { decodeJwtExp } from "./jwt";

function base64url(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function makeToken(payload: object) {
  return `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url(payload)}.signature`;
}

describe("decodeJwtExp", () => {
  it("returns exp in epoch ms for a valid token", () => {
    expect(decodeJwtExp(makeToken({ sub: 1, exp: 1_700_000_000 }))).toBe(
      1_700_000_000_000,
    );
  });

  it("handles base64url characters in the payload", () => {
    // "~~~" encodes to bytes that produce '-' / '_' in base64url
    const token = makeToken({ name: "~~~???", exp: 42 });
    expect(decodeJwtExp(token)).toBe(42_000);
  });

  it("returns null when the token has no exp", () => {
    expect(decodeJwtExp(makeToken({ sub: 1 }))).toBeNull();
  });

  it("returns null when exp is not a number", () => {
    expect(decodeJwtExp(makeToken({ exp: "soon" }))).toBeNull();
  });

  it.each(["", "garbage", "a.b", "a.!!!.c", "a..c", "a.b.c.d"])(
    "returns null for malformed token %j",
    (token) => {
      expect(decodeJwtExp(token)).toBeNull();
    },
  );
});
