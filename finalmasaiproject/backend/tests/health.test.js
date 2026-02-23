const request = require("supertest");
const app = require("../server");

describe("Health Check Endpoint", () => {
    it("should return 200 and OK status", async () => {
        const res = await request(app).get("/api/health");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("status", "OK");
        expect(res.body).toHaveProperty("message", "ShopLocal API is running");
    });
});
