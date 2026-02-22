const supabase = require("../config/supabase");

const getCategories = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("name");

        if (error) throw error;
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const getCategory = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("id", req.params.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "Category not found." });
        }
        res.json(data);
    } catch (error) {
        next(error);
    }
};

module.exports = { getCategories, getCategory };
