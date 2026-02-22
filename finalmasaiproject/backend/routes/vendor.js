const express = require("express");
const router = express.Router();
const { getDashboardStats, getVendorOrders, getVendorProducts } = require("../controllers/vendorController");
const { auth, vendorOnly } = require("../middleware/auth");

router.get("/dashboard", auth, vendorOnly, getDashboardStats);
router.get("/orders", auth, vendorOnly, getVendorOrders);
router.get("/products", auth, vendorOnly, getVendorProducts);

module.exports = router;
