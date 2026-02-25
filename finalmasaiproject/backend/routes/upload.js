const express = require("express");
const router = express.Router();
const multer = require("multer");
const { auth, vendorOnly } = require("../middleware/auth");
const { uploadImage } = require("../controllers/uploadController");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/", auth, vendorOnly, upload.single("image"), uploadImage);

module.exports = router;
