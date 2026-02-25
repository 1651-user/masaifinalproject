const request = require("supertest");
const app = require("../server");

describe("GET /api/products", () => {
    it("should return 200 and an array of products", async () => {
        const res = await request(app).get("/api/products");
        expect(res.statusCode).toBe(200);
        // Expect either an array or an object wrapping an array
        const data = Array.isArray(res.body) ? res.body : res.body.products ?? res.body.data;
        expect(Array.isArray(data)).toBe(true);
    }, 10000); // allow 10s for DB round-trip

    it("should allow filtering by search query without error", async () => {
        const res = await request(app).get("/api/products?search=shirt");
        expect(res.statusCode).toBe(200);
    }, 10000);
});
