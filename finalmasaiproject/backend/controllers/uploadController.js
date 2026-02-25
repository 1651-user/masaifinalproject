const supabase = require("../config/supabase");

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file provided" });
        }

        const file = req.file;
        const ext = file.originalname.split(".").pop().toLowerCase();
        const allowedExts = ["jpg", "jpeg", "png", "webp", "gif"];

        if (!allowedExts.includes(ext)) {
            return res.status(400).json({ error: "Only jpg, jpeg, png, webp and gif files are allowed" });
        }

        const vendorId = req.user.id;
        const filename = `${vendorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filename, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return res.status(500).json({ error: "Failed to upload image: " + uploadError.message });
        }

        const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(filename);

        return res.json({ url: publicUrl });
    } catch (err) {
        console.error("uploadImage error:", err);
        return res.status(500).json({ error: "Server error during upload" });
    }
};

module.exports = { uploadImage };
