const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { register, login, getProfile, updateProfile } = require("../controllers/authController");
const { auth } = require("../middleware/auth");

router.post(
    "/register",
    [
        body("email").isEmail().withMessage("Invalid email address"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
        body("name").notEmpty().withMessage("Name is required"),
        body("role").optional().isIn(["customer", "vendor"]).withMessage("Invalid role"),
    ],
    register
);

router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Invalid email address"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    login
);

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

module.exports = router;
