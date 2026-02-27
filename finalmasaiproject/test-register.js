const http = require("http");

const body = JSON.stringify({
  name: "Test User",
  email: "testuser_" + Date.now() + "@test.com",
  password: "password123",
  role: "customer"
});

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/auth/register",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  }
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", data);
    process.exit(0);
  });
});

req.on("error", (e) => {
  console.error("Connection error:", e.message);
  process.exit(1);
});

req.write(body);
req.end();
