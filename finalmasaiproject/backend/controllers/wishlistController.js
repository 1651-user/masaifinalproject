const supabase = require("../config/supabase");

const getWishlist = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("wishlists")
            .select("*, products(id, name, price, compare_price, images, stock, is_active)")
            .eq("user_id", req.user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const addToWishlist = async (req, res, next) => {
    try {
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).json({ error: "Product ID is required." });
        }

        const { data, error } = await supabase
            .from("wishlists")
            .insert({ user_id: req.user.id, product_id })
            .select("*, products(id, name, price, images)")
            .single();

        if (error) {
            if (error.code === "23505") {
                return res.status(409).json({ error: "Product already in wishlist." });
            }
            throw error;
        }
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

const removeFromWishlist = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from("wishlists")
            .delete()
            .eq("product_id", req.params.id)
            .eq("user_id", req.user.id);

        if (error) throw error;
        res.json({ message: "Removed from wishlist." });
    } catch (error) {
        next(error);
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
