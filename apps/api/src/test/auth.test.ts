import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

// ─────────────────────────────────────────────────────────────────────────────
// Auth route unit tests
// These run against the Express app in memory (no real DB in CI).
// Full integration tests require a running Postgres instance.
// ─────────────────────────────────────────────────────────────────────────────

describe("Auth Routes", () => {
  describe("POST /api/v1/auth/login", () => {
    it("returns 400 for missing body", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({});
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid email format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "not-an-email", password: "short" });
      expect(res.status).toBe(400);
    });

    it("returns 400 for password too short", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "abc" });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/v1/auth/me");
      expect(res.status).toBe(401);
    });

    it("returns 401 with malformed token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer not.a.real.token");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /health", () => {
    it("returns 200 with status ok", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });
});
