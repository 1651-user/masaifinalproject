require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function seed() {
    console.log("🌱 Starting seed...\n");

    // ── 1. Upsert Categories ───────────────────────────────────────
    const categories = [
        { name: "Electronics", slug: "electronics", image_url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400", description: "Gadgets and electronic accessories" },
        { name: "Clothing", slug: "clothing", image_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400", description: "Fashion apparel and accessories" },
        { name: "Home & Garden", slug: "home-garden", image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", description: "Furniture, decor, and garden supplies" },
        { name: "Books", slug: "books", image_url: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400", description: "Books and reading materials" },
        { name: "Sports", slug: "sports", image_url: "https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=400", description: "Sports equipment and activewear" },
        { name: "Beauty", slug: "beauty", image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400", description: "Beauty and personal care" },
        { name: "Handmade", slug: "handmade", image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400", description: "Handcrafted artisan products" },
        { name: "Jewelry", slug: "jewelry", image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400", description: "Fine and fashion jewelry" },
    ];

    const { data: catData, error: catErr } = await supabase
        .from("categories")
        .upsert(categories, { onConflict: "slug" })
        .select();

    if (catErr) { console.error("Category error:", catErr); process.exit(1); }
    console.log(`✅ ${catData.length} categories upserted`);

    const catMap = {};
    catData.forEach(c => { catMap[c.slug] = c.id; });

    // ── 2. Create a demo vendor ────────────────────────────────────
    const vendorEmail = "vendor@shoplocal.demo";
    let vendorId;

    const { data: existingVendor } = await supabase
        .from("users")
        .select("id")
        .eq("email", vendorEmail)
        .single();

    if (existingVendor) {
        vendorId = existingVendor.id;
        console.log("✅ Vendor already exists:", vendorEmail);
    } else {
        const password_hash = await bcrypt.hash("vendor123", 10);
        const { data: newVendor, error: vErr } = await supabase
            .from("users")
            .insert({
                email: vendorEmail,
                password_hash,
                name: "ShopLocal Demo Store",
                role: "vendor",
                store_name: "ShopLocal Demo Store",
                store_description: "Your one-stop shop for everything local and handmade.",
            })
            .select("id")
            .single();
        if (vErr) { console.error("Vendor error:", vErr); process.exit(1); }
        vendorId = newVendor.id;
        console.log("✅ Demo vendor created:", vendorEmail);
    }

    // ── 3. Products ────────────────────────────────────────────────
    const products = [
        // Electronics
        { name: "Wireless Noise-Cancelling Headphones", category: "electronics", price: 2999, compare_price: 4499, stock: 25, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"], description: "Premium sound quality with 30hr battery life and active noise cancellation." },
        { name: "Portable Bluetooth Speaker", category: "electronics", price: 1299, compare_price: 1999, stock: 40, images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"], description: "360° surround sound, waterproof IPX7 rated, 12hr playtime." },
        { name: "Smart Watch Fitness Tracker", category: "electronics", price: 3499, compare_price: 4999, stock: 18, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"], description: "Heart rate, SpO2, GPS tracking with 7-day battery." },
        { name: "4K Action Camera", category: "electronics", price: 5999, compare_price: 7999, stock: 12, images: ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"], description: "Shoot stunning 4K@60fps footage, waterproof to 10m without housing." },
        { name: "Mechanical Gaming Keyboard", category: "electronics", price: 2499, compare_price: 3299, stock: 30, images: ["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600"], description: "RGB backlit, tactile blue switches, full anti-ghosting." },

        // Clothing
        { name: "Classic Linen Kurta (Men)", category: "clothing", price: 799, compare_price: 1299, stock: 60, images: ["https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=600"], description: "Premium linen fabric, relaxed fit, perfect for casual and semi-formal occasions." },
        { name: "Embroidered Kurti (Women)", category: "clothing", price: 999, compare_price: 1499, stock: 50, images: ["https://images.unsplash.com/photo-1583183687897-c9dba52a8b64?w=600"], description: "Hand-embroidered floral patterns, available in 6 vibrant colors." },
        { name: "Streetwear Hoodie", category: "clothing", price: 1199, compare_price: 1799, stock: 45, images: ["https://images.unsplash.com/photo-1556821840-3a63f15bd05c?w=600"], description: "Heavyweight 400GSM fleece, oversized fit, unisex." },
        { name: "Formal Blazer", category: "clothing", price: 2499, compare_price: 3999, stock: 20, images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600"], description: "Tailored fit with premium fabric blend, perfect for office wear." },
        { name: "Denim Jacket", category: "clothing", price: 1599, compare_price: 2299, stock: 35, images: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600"], description: "Classic stonewash denim with custom embroidery on the back." },

        // Home & Garden
        { name: "Ceramic Planter Set (3 pcs)", category: "home-garden", price: 699, compare_price: 999, stock: 55, images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600"], description: "Hand-painted terracotta ceramic planters, drainage holes included." },
        { name: "Bamboo Cutting Board", category: "home-garden", price: 399, compare_price: 599, stock: 80, images: ["https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600"], description: "Eco-friendly bamboo, naturally antibacterial, juice groove." },
        { name: "Scented Soy Candle Set", category: "home-garden", price: 549, compare_price: 799, stock: 70, images: ["https://images.unsplash.com/photo-1603905767853-c5e21e865c13?w=600"], description: "Set of 3 hand-poured soy candles: Lavender, Vanilla, Citrus." },
        { name: "Macramé Wall Hanging", category: "home-garden", price: 899, compare_price: 1399, stock: 25, images: ["https://images.unsplash.com/photo-1558865869-c93f6f8482af?w=600"], description: "Handwoven bohemian wall art, 60cm wide, natural cotton cord." },
        { name: "Brass Table Lamp", category: "home-garden", price: 1799, compare_price: 2499, stock: 15, images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"], description: "Antique brass finish, E27 bulb socket, adjustable head." },

        // Books
        { name: "Atomic Habits (Paperback)", category: "books", price: 349, compare_price: 499, stock: 100, images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600"], description: "James Clear's bestseller on building good habits and breaking bad ones." },
        { name: "The Alchemist (Hardcover)", category: "books", price: 299, compare_price: 450, stock: 85, images: ["https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600"], description: "Paulo Coelho's timeless story about following your dreams." },
        { name: "Art of War (Illustrated)", category: "books", price: 449, compare_price: 699, stock: 60, images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600"], description: "Sun Tzu's classic with modern commentary and beautiful illustrations." },

        // Sports
        { name: "Yoga Mat Premium 6mm", category: "sports", price: 699, compare_price: 999, stock: 90, images: ["https://images.unsplash.com/photo-1601925228616-2dc2ae53c5e1?w=600"], description: "Non-slip, eco-friendly TPE material, carrying strap included." },
        { name: "Cricket Bat (Kashmir Willow)", category: "sports", price: 1299, compare_price: 1999, stock: 30, images: ["https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600"], description: "Grade 1 Kashmir willow, full size, pre-knocked." },
        { name: "Resistance Band Set (5 bands)", category: "sports", price: 499, compare_price: 799, stock: 120, images: ["https://images.unsplash.com/photo-1598971639058-fab3c3109a23?w=600"], description: "5 resistance levels from 5–40kg, latex free, with carry bag." },
        { name: "Running Shoes (Unisex)", category: "sports", price: 2199, compare_price: 3499, stock: 40, images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"], description: "Lightweight, breathable mesh upper, responsive cushioning." },

        // Beauty
        { name: "Vitamin C Serum 30ml", category: "beauty", price: 599, compare_price: 899, stock: 75, images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600"], description: "20% Vitamin C + Hyaluronic Acid, brightens and firms skin." },
        { name: "Charcoal Face Mask Pack", category: "beauty", price: 249, compare_price: 399, stock: 150, images: ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600"], description: "Deep pore cleansing, removes blackheads, pack of 10." },
        { name: "Rose Quartz Face Roller", category: "beauty", price: 799, compare_price: 1199, stock: 60, images: ["https://images.unsplash.com/photo-1599847658050-52f4c5d16e36?w=600"], description: "100% natural rose quartz, promotes lymphatic drainage." },
        { name: "Organic Aloe Vera Gel 200g", category: "beauty", price: 199, compare_price: 299, stock: 200, images: ["https://images.unsplash.com/photo-1611073615830-9f3138a4cc56?w=600"], description: "Pure cold-pressed aloe, no parabens/sulphates, multipurpose use." },

        // Handmade
        { name: "Handwoven Jute Bag", category: "handmade", price: 449, compare_price: 699, stock: 40, images: ["https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600"], description: "Eco-friendly handwoven jute tote with cotton lining, 15L capacity." },
        { name: "Wooden Photo Frame Set", category: "handmade", price: 799, compare_price: 1199, stock: 35, images: ["https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600"], description: "Set of 4 handcrafted mango wood photo frames, rustic finish." },
        { name: "Terracotta Jewellery Stand", category: "handmade", price: 599, compare_price: 899, stock: 28, images: ["https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600"], description: "Hand-painted terracotta jewellery organiser, holds 30+ items." },

        // Jewelry
        { name: "Silver Oxidised Earrings", category: "jewelry", price: 349, compare_price: 549, stock: 80, images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600"], description: "Handcrafted 925 silver, bohemian oxidised finish, hypoallergenic." },
        { name: "Gold-Plated Layered Necklace", category: "jewelry", price: 699, compare_price: 999, stock: 55, images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600"], description: "14k gold plated, 3-layer chain, tarnish resistant, adjustable length." },
        { name: "Beaded Charm Bracelet", category: "jewelry", price: 299, compare_price: 449, stock: 90, images: ["https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600"], description: "Natural stone beads with silver charm, one-size-fits-all stretch cord." },
    ];

    // Insert products in batches
    let inserted = 0;
    for (const p of products) {
        const catId = catMap[p.category];
        if (!catId) { console.warn(`⚠️  No category for slug: ${p.category}`); continue; }

        const { error } = await supabase.from("products").insert({
            vendor_id: vendorId,
            category_id: catId,
            name: p.name,
            description: p.description,
            price: p.price,
            compare_price: p.compare_price,
            images: p.images,
            stock: p.stock,
            is_active: true,
            sku: p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 30),
        });

        if (error) { console.error(`❌ Error inserting "${p.name}":`, error.message); }
        else { inserted++; console.log(`  ✓ ${p.name}`); }
    }

    console.log(`\n🎉 Done! ${inserted}/${products.length} products seeded to Supabase.`);
    process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
