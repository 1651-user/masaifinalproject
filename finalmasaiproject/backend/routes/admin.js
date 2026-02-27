const express = require("express");
const router = express.Router();
const { auth, adminOnly } = require("../middleware/auth");
const {
    getStats,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllOrders,
    getAllProducts,
    toggleProductStatus,
    getSettings,
    updateSettings,
} = require("../controllers/adminController");

// All routes require authentication + admin role
router.use(auth, adminOnly);

// Platform stats
router.get("/stats", getStats);

// User management
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Orders (all platform)
router.get("/orders", getAllOrders);

// Products (all platform)
router.get("/products", getAllProducts);
router.put("/products/:id/toggle", toggleProductStatus);

// Platform settings
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

module.exports = router;
