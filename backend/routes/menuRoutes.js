const express = require("express");

const router = express.Router();

const {
    getMenu,
    createMenu,
    updateMenu,
    deleteMenu,
    updateAvailability,
} = require("../controllers/menuController");

const {
    protect,
    adminOnly,
} = require("../middleware/adminMiddleware");


// =========================
// CUSTOMER
// =========================

router.get("/", getMenu);


// =========================
// ADMIN ONLY
// =========================

router.post(
    "/",
    protect,
    adminOnly,
    createMenu
);

router.put(
    "/:id",
    protect,
    adminOnly,
    updateMenu
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteMenu
);

router.patch(
    "/:id/availability",
    protect,
    adminOnly,
    updateAvailability
);

module.exports = router;