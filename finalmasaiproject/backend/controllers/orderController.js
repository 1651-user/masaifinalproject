const supabase = require("../config/supabase");

const createOrder = async (req, res, next) => {
    try {
        const { shipping_address, payment_method = "cod", coupon_code } = req.body;

        if (!shipping_address) {
            return res.status(400).json({ error: "Shipping address is required." });
        }

        const { data: cartItems, error: cartError } = await supabase
            .from("cart_items")
            .select("*, products(id, name, price, stock, vendor_id)")
            .eq("user_id", req.user.id);

        if (cartError) throw cartError;
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty." });
        }

        let total = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
        let discount_amount = 0;

        if (coupon_code) {
            const { data: coupon } = await supabase
                .from("coupons")
                .select("*")
                .eq("code", coupon_code)
                .eq("is_active", true)
                .single();

            if (coupon && new Date(coupon.expires_at) > new Date() && coupon.used_count < coupon.max_uses) {
                discount_amount = (total * coupon.discount_percent) / 100;
                total -= discount_amount;

                await supabase
                    .from("coupons")
                    .update({ used_count: coupon.used_count + 1 })
                    .eq("id", coupon.id);
            }
        }

        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: req.user.id,
                total: total.toFixed(2),
                shipping_address,
                payment_method,
                coupon_code,
                discount_amount: discount_amount.toFixed(2),
                status: 'delivered',
            })
            .select()
            .single();

        if (orderError) throw orderError;

        const orderItems = cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            vendor_id: item.products.vendor_id,
            quantity: item.quantity,
            price: item.products.price,
        }));

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
        if (itemsError) throw itemsError;

        for (const item of cartItems) {
            await supabase
                .from("products")
                .update({ stock: item.products.stock - item.quantity })
                .eq("id", item.product_id);
        }

        await supabase.from("cart_items").delete().eq("user_id", req.user.id);

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

const getOrders = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("orders")
            .select("*, order_items(*, products(name, images, price))")
            .eq("user_id", req.user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const getOrder = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("orders")
            .select("*, order_items(*, products(name, images, price, users!products_vendor_id_fkey(store_name)))")
            .eq("id", req.params.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "Order not found." });
        }

        
        if (data.user_id !== req.user.id) {
            const isVendor = data.order_items.some((item) => item.vendor_id === req.user.id);
            if (!isVendor) {
                return res.status(403).json({ error: "Not authorized." });
            }
        }

        res.json(data);
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status." });
        }

        const { data, error } = await supabase
            .from("orders")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const cancelOrder = async (req, res, next) => {
    try {
        
        const { data: order, error: fetchError } = await supabase
            .from("orders")
            .select("*, order_items(product_id, quantity, products(stock))")
            .eq("id", req.params.id)
            .eq("user_id", req.user.id)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({ error: "Order not found." });
        }

        if (order.status === "cancelled") {
            return res.status(400).json({ error: "Order is already cancelled." });
        }

        
        const { data: updatedOrder, error: cancelError } = await supabase
            .from("orders")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("id", req.params.id)
            .select()
            .single();

        if (cancelError) throw cancelError;

        
        for (const item of order.order_items) {
            await supabase
                .from("products")
                .update({ stock: (item.products?.stock || 0) + item.quantity })
                .eq("id", item.product_id);
        }

        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus, cancelOrder };
