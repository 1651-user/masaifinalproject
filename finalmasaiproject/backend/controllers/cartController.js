const supabase = require("../config/supabase");

const getCart = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("cart_items")
            .select("*, products(id, name, price, compare_price, images, stock, vendor_id, users!products_vendor_id_fkey(store_name))")
            .eq("user_id", req.user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const addToCart = async (req, res, next) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({ error: "Product ID is required." });
        }

        const { data: product } = await supabase
            .from("products")
            .select("stock, is_active")
            .eq("id", product_id)
            .single();

        if (!product || !product.is_active) {
            return res.status(404).json({ error: "Product not available." });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ error: "Insufficient stock." });
        }

        const { data: existing } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("user_id", req.user.id)
            .eq("product_id", product_id)
            .single();

        let data, error;
        if (existing) {
            ({ data, error } = await supabase
                .from("cart_items")
                .update({ quantity: existing.quantity + quantity })
                .eq("id", existing.id)
                .select("*, products(id, name, price, images, stock)")
                .single());
        } else {
            ({ data, error } = await supabase
                .from("cart_items")
                .insert({ user_id: req.user.id, product_id, quantity })
                .select("*, products(id, name, price, images, stock)")
                .single());
        }

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: "Quantity must be at least 1." });
        }

        const { data, error } = await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("id", req.params.id)
            .eq("user_id", req.user.id)
            .select("*, products(id, name, price, images, stock)")
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: "Cart item not found." });
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const removeFromCart = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("id", req.params.id)
            .eq("user_id", req.user.id);

        if (error) throw error;
        res.json({ message: "Item removed from cart." });
    } catch (error) {
        next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("user_id", req.user.id);

        if (error) throw error;
        res.json({ message: "Cart cleared." });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
