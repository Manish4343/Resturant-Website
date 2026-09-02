const express = require("express");

const router = express.Router();

const {
    createReservation,
    getMyReservations,
    getAllReservations,
    approveReservation,
    rejectReservation,
    cancelReservation,
} = require("../controllers/reservationController");

const {
    protect,
    adminOnly,
} = require("../middleware/adminMiddleware");


// =====================================================
// CUSTOMER
// =====================================================

router.post(
    "/",
    protect,
    createReservation
);


router.get(
    "/my",
    protect,
    getMyReservations
);


router.patch(
    "/:id/cancel",
    protect,
    cancelReservation
);


// =====================================================
// ADMIN
// =====================================================

router.get(
    "/",
    protect,
    adminOnly,
    getAllReservations
);


router.patch(
    "/:id/approve",
    protect,
    adminOnly,
    approveReservation
);


router.patch(
    "/:id/reject",
    protect,
    adminOnly,
    rejectReservation
);


module.exports = router;