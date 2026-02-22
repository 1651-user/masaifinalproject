const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrder, updateOrderStatus } = require("../controllers/orderController");
const { auth, vendorOnly } = require("../middleware/auth");

router.post("/", auth, createOrder);
router.get("/", auth, getOrders);
router.get("/:id", auth, getOrder);
router.put("/:id/status", auth, vendorOnly, updateOrderStatus);

module.exports = router;
