const supabase = require("../config/supabase");

// Get vendor dashboard stats
const getDashboardStats = async (req, res, next) => {
    try {
        const vendorId = req.user.id;

        // Get products count
        const { count: productCount } = await supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("vendor_id", vendorId);

        // Get order items for this vendor
        const { data: orderItems } = await supabase
            .from("order_items")
            .select("quantity, price, orders(status, created_at)")
            .eq("vendor_id", vendorId);

        const totalRevenue = orderItems?.reduce((sum, item) => {
            if (item.orders?.status !== "cancelled") {
                return sum + item.price * item.quantity;
            }
            return sum;
        }, 0) || 0;

        const totalOrders = new Set(orderItems?.map((item) => item.order_id)).size || orderItems?.length || 0;

        // Get low stock products
        const { data: lowStock } = await supabase
            .from("products")
            .select("id, name, stock")
            .eq("vendor_id", vendorId)
            .lt("stock", 10)
            .eq("is_active", true)
            .order("stock");

        // Get recent orders
        const { data: recentOrders } = await supabase
            .from("order_items")
            .select("*, products(name, images), orders(id, status, total, created_at, users(name, email))")
            .eq("vendor_id", vendorId)
            .order("created_at", { ascending: false })
            .limit(10);

        res.json({
            stats: {
                total_products: productCount || 0,
                total_revenue: totalRevenue.toFixed(2),
                total_orders: totalOrders,
                low_stock_count: lowStock?.length || 0,
            },
            low_stock_products: lowStock || [],
            recent_orders: recentOrders || [],
        });
    } catch (error) {
        next(error);
    }
};

// Get vendor orders
const getVendorOrders = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("order_items")
            .select("*, products(name, images, price), orders(id, status, total, shipping_address, created_at, updated_at, users(name, email, phone))")
            .eq("vendor_id", req.user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

// Get vendor products
const getVendorProducts = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*, categories(name, slug)")
            .eq("vendor_id", req.user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats, getVendorOrders, getVendorProducts };
