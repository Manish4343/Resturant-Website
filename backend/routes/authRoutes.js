const express = require("express");

const router = express.Router();

const {
    register,
    login,
    getMe,
} = require("../controllers/authController");

const {
    protect,
} = require("../middleware/adminMiddleware");

// Register
router.post(
    "/register",
    register
);

// Login
router.post(
    "/login",
    login
);

// Current user
router.get(
    "/me",
    protect,
    getMe
);

module.exports = router;