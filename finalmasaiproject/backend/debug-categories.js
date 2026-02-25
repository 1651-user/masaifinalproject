require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function debug() {
    // 1. List all categories
    const { data: cats } = await supabase.from("categories").select("id, name, slug");
    console.log("\n=== CATEGORIES ===");
    cats.forEach(c => console.log(`  slug="${c.slug}"  name="${c.name}"  id=${c.id}`));

    // 2. Count products per category
    console.log("\n=== PRODUCTS PER CATEGORY ===");
    for (const cat of cats) {
        const { count } = await supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("category_id", cat.id);
        console.log(`  ${cat.name} (${cat.slug}): ${count} products`);
    }

    // 3. Check for products with NULL category_id
    const { count: nullCount } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .is("category_id", null);
    console.log(`\n  Products with NULL category_id: ${nullCount}`);

    // 4. Total products
    const { count: total } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true });
    console.log(`  Total products: ${total}`);

    // 5. Test slug resolution for jewelry
    console.log("\n=== TEST: slug='jewelry' lookup ===");
    const { data: jewelryCat, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("slug", "jewelry")
        .single();
    if (error) console.log("  ERROR:", error.message);
    else console.log("  Found:", jewelryCat);

    process.exit(0);
}

debug().catch(e => { console.error(e); process.exit(1); });
