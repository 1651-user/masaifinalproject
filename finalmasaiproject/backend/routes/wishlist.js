const express = require("express");
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlistController");
const { auth, customerOnly } = require("../middleware/auth");

router.get("/", auth, customerOnly, getWishlist);
router.post("/", auth, customerOnly, addToWishlist);
router.delete("/:id", auth, customerOnly, removeFromWishlist);

module.exports = router;
