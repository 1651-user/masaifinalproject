const express = require("express");
const router = express.Router();
const { getProductReviews, addReview, deleteReview } = require("../controllers/reviewController");
const { auth } = require("../middleware/auth");

router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", auth, addReview);
router.delete("/:id", auth, deleteReview);

module.exports = router;
