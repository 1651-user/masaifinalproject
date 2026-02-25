const express = require("express");
const router = express.Router();
const { getProductReviews, addReview, deleteReview } = require("../controllers/reviewController");
const { auth, customerOnly } = require("../middleware/auth");

router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", auth, customerOnly, addReview);
router.delete("/:id", auth, customerOnly, deleteReview);

module.exports = router;
