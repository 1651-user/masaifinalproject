const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

const vendorOnly = (req, res, next) => {
    if (req.user.role !== "vendor") {
        return res.status(403).json({ error: "Access denied. Vendors only." });
    }
    next();
};

const customerOnly = (req, res, next) => {
    if (req.user.role !== "customer") {
        return res.status(403).json({ error: "Access denied. Customers only." });
    }
    next();
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
};

module.exports = { auth, vendorOnly, customerOnly, adminOnly };
