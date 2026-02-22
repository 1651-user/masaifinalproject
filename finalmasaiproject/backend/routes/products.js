const express = require("express");
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { auth, vendorOnly } = require("../middleware/auth");

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", auth, vendorOnly, createProduct);
router.put("/:id", auth, vendorOnly, updateProduct);
router.delete("/:id", auth, vendorOnly, deleteProduct);

module.exports = router;
