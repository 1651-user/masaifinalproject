const supabase = require("../config/supabase");

const getCoupons = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .eq("vendor_id", req.user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const createCoupon = async (req, res, next) => {
    try {
        const { code, discount_percent, max_uses = 100, expires_at } = req.body;

        if (!code || !discount_percent || !expires_at) {
            return res.status(400).json({ error: "Code, discount percent, and expiry date are required." });
        }

        const { data, error } = await supabase
            .from("coupons")
            .insert({
                vendor_id: req.user.id,
                code: code.toUpperCase(),
                discount_percent,
                max_uses,
                expires_at,
            })
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                return res.status(409).json({ error: "Coupon code already exists." });
            }
            throw error;
        }
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

const validateCoupon = async (req, res, next) => {
    try {
        const { code } = req.params;

        const { data: coupon, error } = await supabase
            .from("coupons")
            .select("id, code, discount_percent, expires_at, is_active, max_uses, used_count")
            .eq("code", code.toUpperCase())
            .eq("is_active", true)
            .single();

        if (error || !coupon) {
            return res.status(404).json({ error: "Invalid coupon code." });
        }

        if (new Date(coupon.expires_at) < new Date()) {
            return res.status(400).json({ error: "Coupon has expired." });
        }

        if (coupon.used_count >= coupon.max_uses) {
            return res.status(400).json({ error: "Coupon usage limit reached." });
        }

        res.json({ valid: true, discount_percent: coupon.discount_percent });
    } catch (error) {
        next(error);
    }
};

const toggleCoupon = async (req, res, next) => {
    try {
        const { data: existing } = await supabase
            .from("coupons")
            .select("is_active, vendor_id")
            .eq("id", req.params.id)
            .single();

        if (!existing || existing.vendor_id !== req.user.id) {
            return res.status(403).json({ error: "Not authorized." });
        }

        const { data, error } = await supabase
            .from("coupons")
            .update({ is_active: !existing.is_active })
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const deleteCoupon = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from("coupons")
            .delete()
            .eq("id", req.params.id)
            .eq("vendor_id", req.user.id);

        if (error) throw error;
        res.json({ message: "Coupon deleted." });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCoupons, createCoupon, validateCoupon, toggleCoupon, deleteCoupon };
