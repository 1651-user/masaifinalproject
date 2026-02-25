const request = require("supertest");
const app = require("../server");

describe("POST /api/auth/register", () => {
    it("should return 400 when required fields are missing", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "missing@test.com" }); // no password or name
        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it("should return 4xx or 2xx — endpoint is reachable", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ name: "Test", email: "not-an-email", password: "Password1!" });
        // Accept either success or client error — just verify the route responds
        expect(res.statusCode).toBeLessThan(500);
    });
});

describe("POST /api/auth/login", () => {
    it("should return 401 for invalid credentials", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "nobody@example.com", password: "WrongPassword99!" });
        expect(res.statusCode).toBe(401);
    });

    it("should return 400 when payload is empty", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({});
        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
});
