require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = "admin@shoplocal.in";
    const password = "adminpassword"; // We will use this to login via the browser
    const name = "Super Admin";

    const password_hash = await bcrypt.hash(password, 10);

    const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();

    if (existing) {
        await supabase.from("users").update({ role: "admin", password_hash }).eq("id", existing.id);
        console.log("Admin account existed, updated password and ensured role is 'admin'.");
        return;
    }

    const { error } = await supabase
        .from("users")
        .insert({ email, password_hash, name, role: "admin" });

    if (error) {
        console.error("Error creating admin:", error.message);
    } else {
        console.log("Admin created successfully!");
    }
}

createAdmin();
