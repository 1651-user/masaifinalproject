const request = require("supertest");
const app = require("../server");

describe("GET /api/health", () => {
    it("should return 200 with status OK", async () => {
        const res = await request(app).get("/api/health");
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("OK");
    });
});
