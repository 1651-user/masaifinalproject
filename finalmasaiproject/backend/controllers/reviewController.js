const supabase = require("../config/supabase");

// Get reviews for a product
const getProductReviews = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("reviews")
            .select("*, users(name, avatar_url)")
            .eq("product_id", req.params.productId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

// Add review
const addReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5." });
        }

        const { data, error } = await supabase
            .from("reviews")
            .insert({
                user_id: req.user.id,
                product_id: req.params.productId,
                rating,
                comment,
            })
            .select("*, users(name, avatar_url)")
            .single();

        if (error) {
            if (error.code === "23505") {
                return res.status(409).json({ error: "You already reviewed this product." });
            }
            throw error;
        }
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

// Delete review
const deleteReview = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from("reviews")
            .delete()
            .eq("id", req.params.id)
            .eq("user_id", req.user.id);

        if (error) throw error;
        res.json({ message: "Review deleted." });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProductReviews, addReview, deleteReview };
