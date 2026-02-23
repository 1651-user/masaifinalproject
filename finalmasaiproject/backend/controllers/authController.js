const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const supabase = require("../config/supabase");

// Register
const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { email, password, name, role = "customer", store_name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, password, and name are required." });
        }

        // Check if user exists
        const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single();

        if (existing) {
            return res.status(409).json({ error: "Email already registered." });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const { data: user, error } = await supabase
            .from("users")
            .insert({
                email,
                password_hash,
                name,
                role,
                store_name: role === "vendor" ? store_name : null,
            })
            .select("id, email, name, role, store_name, avatar_url, created_at")
            .single();

        if (error) throw error;

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ user, token });
    } catch (error) {
        next(error);
    }
};

// Login
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const { password_hash, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        next(error);
    }
};

// Get current user profile
const getProfile = async (req, res, next) => {
    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("id, email, name, role, avatar_url, phone, address, store_name, store_description, created_at")
            .eq("id", req.user.id)
            .single();

        if (error) throw error;
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Update profile
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, address, avatar_url, store_name, store_description } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        if (address !== undefined) updates.address = address;
        if (avatar_url !== undefined) updates.avatar_url = avatar_url;
        if (store_name !== undefined) updates.store_name = store_name;
        if (store_description !== undefined) updates.store_description = store_description;

        const { data: user, error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", req.user.id)
            .select("id, email, name, role, avatar_url, phone, address, store_name, store_description, created_at")
            .single();

        if (error) throw error;
        res.json(user);
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getProfile, updateProfile };
