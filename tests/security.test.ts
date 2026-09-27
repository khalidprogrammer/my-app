import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "@/lib/ratelimit";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("rate limiter", () => {
  it("allows within the limit then blocks", () => {
    const key = `test:${Date.now()}:a`;
    assert.equal(checkRateLimit(key, 2, 60_000), true);
    assert.equal(checkRateLimit(key, 2, 60_000), true);
    assert.equal(checkRateLimit(key, 2, 60_000), false);
  });

  it("resets after the window", async () => {
    const key = `test:${Date.now()}:b`;
    assert.equal(checkRateLimit(key, 1, 50), true);
    assert.equal(checkRateLimit(key, 1, 50), false);
    await new Promise((r) => setTimeout(r, 80));
    assert.equal(checkRateLimit(key, 1, 50), true);
  });

  it("tracks keys independently", () => {
    const a = `test:${Date.now()}:c1`;
    const b = `test:${Date.now()}:c2`;
    assert.equal(checkRateLimit(a, 1, 60_000), true);
    assert.equal(checkRateLimit(a, 1, 60_000), false);
    assert.equal(checkRateLimit(b, 1, 60_000), true);
  });
});

describe("password hashing", () => {
  it("round-trips and rejects wrong input", async () => {
    const hash = await hashPassword("Verify123!");
    assert.match(hash, /^scrypt:[0-9a-f]+:[0-9a-f]+$/);
    assert.equal(await verifyPassword("Verify123!", hash), true);
    assert.equal(await verifyPassword("wrong", hash), false);
    assert.equal(await verifyPassword("x", "garbage"), false);
  });

  it("salts identical passwords differently", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    assert.notEqual(a, b);
    assert.equal(await verifyPassword("same-password", a), true);
    assert.equal(await verifyPassword("same-password", b), true);
  });
});
