const express = require("express");

const router = express.Router();


// =====================================================
// CONTROLLERS
// =====================================================

const {
    createOrder,
    getOrders,
    getMyOrders,
    getMyOrderById,
    updateOrderStatus,
} = require("../controllers/orderController");


// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const {
    protect,
    adminOnly,
} = require("../middleware/adminMiddleware");


// =====================================================
// CUSTOMER - CREATE ORDER
// =====================================================

router.post(
    "/",
    protect,
    createOrder
);


// =====================================================
// CUSTOMER - MY ORDERS
// =====================================================

router.get(
    "/my-orders",
    protect,
    getMyOrders
);


// =====================================================
// CUSTOMER - SINGLE ORDER
// =====================================================

router.get(
    "/my-orders/:id",
    protect,
    getMyOrderById
);


// =====================================================
// ADMIN - GET ALL ORDERS
// =====================================================

router.get(
    "/",
    protect,
    adminOnly,
    getOrders
);


// =====================================================
// ADMIN - UPDATE ORDER STATUS
// =====================================================

router.patch(
    "/:id/status",
    protect,
    adminOnly,
    updateOrderStatus
);


module.exports = router;