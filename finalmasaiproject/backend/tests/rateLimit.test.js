const request = require("supertest");
const app = require("../server");

describe("Rate Limiter", () => {
    it("should limit requests to /api/auth endpoints after 10 attempts", async () => {
        // Send 10 requests - these should pass (or fail with 400/401/404, but not 429)
        for (let i = 0; i < 10; i++) {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "test@example.com", password: "wrongpassword" });

            // Should not be rate limited yet
            expect(res.statusCode).not.toBe(429);
        }

        // The 11th request should be rate limited
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@example.com", password: "wrongpassword" });

        expect(res.statusCode).toBe(429);
        expect(res.body.error).toBe("Too many authentication attempts, please try again later.");
    });
});
