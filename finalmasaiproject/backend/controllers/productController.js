const supabase = require("../config/supabase");

const getProducts = async (req, res, next) => {
    try {
        const {
            search,
            category,
            min_price,
            max_price,
            sort = "created_at",
            order = "desc",
            page = 1,
            limit = 12,
            vendor_id,
        } = req.query;

        let query = supabase
            .from("products")
            .select("*, categories(name, slug), users!products_vendor_id_fkey(name, store_name)", { count: "exact" })
            .eq("is_active", true);

        if (search) {
            query = query.ilike("name", `%${search}%`);
        }
        if (category) {
            // Support both UUID and slug values for category
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
            if (isUUID) {
                query = query.eq("category_id", category);
            } else {
                // slug — resolve to category_id first
                const { data: cat } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("slug", category)
                    .single();
                if (cat) {
                    query = query.eq("category_id", cat.id);
                } else {
                    // No matching category — return empty
                    return res.json({ products: [], pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 } });
                }
            }
        }
        if (vendor_id) {
            query = query.eq("vendor_id", vendor_id);
        }
        if (min_price) {
            query = query.gte("price", parseFloat(min_price));
        }
        if (max_price) {
            query = query.lte("price", parseFloat(max_price));
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query = query.order(sort, { ascending: order === "asc" }).range(offset, offset + parseInt(limit) - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        res.json({
            products: data,
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

const getProduct = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*, categories(name, slug), users!products_vendor_id_fkey(name, store_name, avatar_url)")
            .eq("id", req.params.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "Product not found." });
        }

        // Get average rating
        const { data: reviews } = await supabase
            .from("reviews")
            .select("rating")
            .eq("product_id", req.params.id);

        const avgRating = reviews?.length
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        res.json({ ...data, avg_rating: parseFloat(avgRating), review_count: reviews?.length || 0 });
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, compare_price, category_id, images, stock, sku } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ error: "Name and price are required." });
        }

        const { data, error } = await supabase
            .from("products")
            .insert({
                vendor_id: req.user.id,
                name,
                description,
                price: parseFloat(price),
                compare_price: compare_price ? parseFloat(compare_price) : null,
                category_id,
                images: images || [],
                stock: parseInt(stock) || 0,
                sku,
            })
            .select("*, categories(name, slug)")
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { name, description, price, compare_price, category_id, images, stock, sku, is_active } = req.body;

        const { data: existing } = await supabase
            .from("products")
            .select("vendor_id")
            .eq("id", req.params.id)
            .single();

        if (!existing || existing.vendor_id !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to update this product." });
        }

        const updates = { updated_at: new Date().toISOString() };
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (price !== undefined) updates.price = parseFloat(price);
        if (compare_price !== undefined) updates.compare_price = parseFloat(compare_price);
        if (category_id !== undefined) updates.category_id = category_id;
        if (images !== undefined) updates.images = images;
        if (stock !== undefined) updates.stock = parseInt(stock);
        if (sku !== undefined) updates.sku = sku;
        if (is_active !== undefined) updates.is_active = is_active;

        const { data, error } = await supabase
            .from("products")
            .update(updates)
            .eq("id", req.params.id)
            .select("*, categories(name, slug)")
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { data: existing } = await supabase
            .from("products")
            .select("vendor_id")
            .eq("id", req.params.id)
            .single();

        if (!existing || existing.vendor_id !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to delete this product." });
        }

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", req.params.id);

        if (error) throw error;
        res.json({ message: "Product deleted successfully." });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
