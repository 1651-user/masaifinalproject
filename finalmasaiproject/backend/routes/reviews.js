const express = require("express");
const router = express.Router();
const { getProductReviews, addReview, deleteReview, updateReview, canReview } = require("../controllers/reviewController");
const { auth, customerOnly } = require("../middleware/auth");

router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", auth, customerOnly, addReview);
router.put("/:id", auth, customerOnly, updateReview);
router.delete("/:id", auth, customerOnly, deleteReview);
router.get("/can-review/:productId", auth, customerOnly, canReview);

module.exports = router;
