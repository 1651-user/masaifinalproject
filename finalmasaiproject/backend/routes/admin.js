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


router.use(auth, adminOnly);


router.get("/stats", getStats);


router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);


router.get("/orders", getAllOrders);


router.get("/products", getAllProducts);
router.put("/products/:id/toggle", toggleProductStatus);


router.get("/settings", getSettings);
router.put("/settings", updateSettings);

module.exports = router;
