const express = require("express");
const router = express.Router();
const { getCoupons, createCoupon, validateCoupon, toggleCoupon, deleteCoupon } = require("../controllers/couponController");
const { auth, vendorOnly } = require("../middleware/auth");

router.get("/validate/:code", validateCoupon);
router.get("/", auth, vendorOnly, getCoupons);
router.post("/", auth, vendorOnly, createCoupon);
router.put("/:id/toggle", auth, vendorOnly, toggleCoupon);
router.delete("/:id", auth, vendorOnly, deleteCoupon);

module.exports = router;
