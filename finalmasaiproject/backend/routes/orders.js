const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrder, updateOrderStatus, cancelOrder } = require("../controllers/orderController");
const { auth, vendorOnly, customerOnly } = require("../middleware/auth");

router.post("/", auth, customerOnly, createOrder);
router.get("/", auth, customerOnly, getOrders);
router.get("/:id", auth, customerOnly, getOrder);
router.put("/:id/status", auth, vendorOnly, updateOrderStatus);
router.put("/:id/cancel", auth, customerOnly, cancelOrder);

module.exports = router;
