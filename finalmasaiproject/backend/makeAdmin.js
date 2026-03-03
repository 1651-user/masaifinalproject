require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.error("Usage: node makeAdmin.js <user-email>");
        process.exit(1);
    }

    console.log(`Looking up user: ${email}...`);

    const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("id, email, name, role")
        .eq("email", email)
        .single();

    if (fetchError || !user) {
        console.error(`Error: User with email ${email} not found.`);
        process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.role})`);

    const { error: updateError } = await supabase
        .from("users")
        .update({ role: "admin" })
        .eq("id", user.id);

    if (updateError) {
        console.error("Error updating user role:", updateError.message);
        process.exit(1);
    }

    console.log(`\n✅ SUCCESS! ${user.name} has been promoted to Admin.`);
    console.log(`They can now log in at http://localhost:5173/login and access the Admin Panel.`);
}

makeAdmin();
