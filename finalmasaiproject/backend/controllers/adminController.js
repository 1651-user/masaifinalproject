const supabase = require("../config/supabase");

// ─── Platform Stats ───────────────────────────────────────────────────────────

const getStats = async (req, res, next) => {
    try {
        const [
            { count: totalUsers },
            { count: totalVendors },
            { count: totalProducts },
            { count: totalOrders },
            { data: revenueData },
            { data: recentUsers },
            { data: recentOrders },
        ] = await Promise.all([
            supabase.from("users").select("id", { count: "exact", head: true }),
            supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "vendor"),
            supabase.from("products").select("id", { count: "exact", head: true }),
            supabase.from("orders").select("id", { count: "exact", head: true }),
            supabase.from("orders").select("total").neq("status", "cancelled"),
            supabase.from("users").select("id, name, email, role, is_active, created_at").order("created_at", { ascending: false }).limit(5),
            supabase.from("orders").select("id, total, status, created_at, users(name, email)").order("created_at", { ascending: false }).limit(5),
        ]);

        const totalRevenue = revenueData?.reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;

        res.json({
            stats: {
                total_users: totalUsers || 0,
                total_vendors: totalVendors || 0,
                total_products: totalProducts || 0,
                total_orders: totalOrders || 0,
                total_revenue: totalRevenue.toFixed(2),
            },
            recent_users: recentUsers || [],
            recent_orders: recentOrders || [],
        });
    } catch (error) {
        next(error);
    }
};

// ─── User Management ──────────────────────────────────────────────────────────

const getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from("users")
            .select("id, name, email, role, is_active, phone, store_name, created_at", { count: "exact" });

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }
        if (role) {
            query = query.eq("role", role);
        }
        if (status === "active") {
            query = query.eq("is_active", true);
        } else if (status === "banned") {
            query = query.eq("is_active", false);
        }

        query = query.order("created_at", { ascending: false }).range(offset, offset + parseInt(limit) - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({
            users: data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("id, name, email, role, is_active, phone, address, store_name, store_description, avatar_url, created_at")
            .eq("id", req.params.id)
            .single();

        if (error || !user) return res.status(404).json({ error: "User not found." });

        const [{ data: orders }, { count: productCount }] = await Promise.all([
            supabase.from("orders").select("id, total, status, created_at").eq("user_id", req.params.id).order("created_at", { ascending: false }).limit(5),
            supabase.from("products").select("id", { count: "exact", head: true }).eq("vendor_id", req.params.id),
        ]);

        res.json({ ...user, recent_orders: orders || [], product_count: productCount || 0 });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { role, is_active } = req.body;
        const updates = {};
        if (role !== undefined) updates.role = role;
        if (is_active !== undefined) updates.is_active = is_active;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No valid fields to update." });
        }

        const { data, error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", req.params.id)
            .select("id, name, email, role, is_active, created_at")
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: "Cannot delete your own admin account." });
        }

        const { error } = await supabase.from("users").delete().eq("id", req.params.id);
        if (error) throw error;
        res.json({ message: "User deleted successfully." });
    } catch (error) {
        next(error);
    }
};

// ─── Orders (All Platform) ────────────────────────────────────────────────────

const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from("orders")
            .select("id, total, status, payment_method, created_at, updated_at, users(id, name, email), order_items(id)", { count: "exact" });

        if (status) query = query.eq("status", status);
        if (search) query = query.ilike("id", `%${search}%`);

        query = query.order("created_at", { ascending: false }).range(offset, offset + parseInt(limit) - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({
            orders: data,
            pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / parseInt(limit)) },
        });
    } catch (error) {
        next(error);
    }
};

// ─── Products (All Platform) ──────────────────────────────────────────────────

const getAllProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, is_active } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from("products")
            .select("id, name, price, stock, is_active, images, created_at, categories(name), users!products_vendor_id_fkey(name, store_name, email)", { count: "exact" });

        if (search) query = query.ilike("name", `%${search}%`);
        if (is_active !== undefined) query = query.eq("is_active", is_active === "true");

        query = query.order("created_at", { ascending: false }).range(offset, offset + parseInt(limit) - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({
            products: data,
            pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / parseInt(limit)) },
        });
    } catch (error) {
        next(error);
    }
};

const toggleProductStatus = async (req, res, next) => {
    try {
        const { data: existing } = await supabase.from("products").select("is_active").eq("id", req.params.id).single();
        if (!existing) return res.status(404).json({ error: "Product not found." });

        const { data, error } = await supabase
            .from("products")
            .update({ is_active: !existing.is_active, updated_at: new Date().toISOString() })
            .eq("id", req.params.id)
            .select("id, name, is_active")
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

// ─── Platform Settings ────────────────────────────────────────────────────────

const getSettings = async (req, res, next) => {
    try {
        const { data, error } = await supabase.from("platform_settings").select("*");
        if (error) throw error;

        // Convert array of {key, value} rows to a plain object for convenience
        const settings = {};
        (data || []).forEach(row => { settings[row.key] = row.value; });
        res.json(settings);
    } catch (error) {
        next(error);
    }
};

const updateSettings = async (req, res, next) => {
    try {
        const entries = Object.entries(req.body);
        if (entries.length === 0) return res.status(400).json({ error: "No settings provided." });

        for (const [key, value] of entries) {
            await supabase
                .from("platform_settings")
                .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
        }

        res.json({ message: "Settings updated successfully." });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStats,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllOrders,
    getAllProducts,
    toggleProductStatus,
    getSettings,
    updateSettings,
};
