const supabase = require("../config/supabase");

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

const addReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5." });
        }

        const { data, error } = await supabase
            .from("reviews")
            .insert({
                user_id: req.user.id,
                product_id: productId,
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

const updateReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: "Rating must be between 1 and 5." });
        }

        const updates = {};
        if (rating) updates.rating = rating;
        if (comment !== undefined) updates.comment = comment;

        const { data, error } = await supabase
            .from("reviews")
            .update(updates)
            .eq("id", req.params.id)
            .eq("user_id", req.user.id)
            .select("*, users(name, avatar_url)")
            .single();

        if (error) {
            return res.status(404).json({ error: "Review not found or you don't have permission to edit it." });
        }

        res.json(data);
    } catch (error) {
        next(error);
    }
};

const voteHelpful = async (req, res, next) => {
    try {
        // Get current helpful_count
        const { data: review, error: fetchError } = await supabase
            .from("reviews")
            .select("helpful_count")
            .eq("id", req.params.id)
            .single();

        if (fetchError || !review) {
            return res.status(404).json({ error: "Review not found." });
        }

        const { data, error } = await supabase
            .from("reviews")
            .update({ helpful_count: (review.helpful_count || 0) + 1 })
            .eq("id", req.params.id)
            .select("id, helpful_count")
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};


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

module.exports = { getProductReviews, addReview, deleteReview, updateReview, voteHelpful };
