const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require("../controllers/cartController");
const { auth, customerOnly } = require("../middleware/auth");

router.get("/", auth, customerOnly, getCart);
router.post("/", auth, customerOnly, addToCart);
router.put("/:id", auth, customerOnly, updateCartItem);
router.delete("/clear", auth, customerOnly, clearCart);
router.delete("/:id", auth, customerOnly, removeFromCart);

module.exports = router;
