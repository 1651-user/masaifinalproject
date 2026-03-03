require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
    console.log("Testing Supabase connection...");
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError) {
        console.error("Categories error:", catError);
    } else {
        console.log("Categories found:", categories.length);
        if (categories.length > 0) console.log("Example category:", categories[0].name);
    }

    const { data: products, error: prodError } = await supabase.from('products').select('*');
    if (prodError) {
        console.error("Products error:", prodError);
    } else {
        console.log("Products found:", products.length);
        if (products.length > 0) console.log("Example product:", products[0].name);
    }
}

test();
