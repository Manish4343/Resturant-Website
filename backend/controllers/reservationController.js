const Reservation = require("../models/Reservation");


// =====================================================
// TABLE CONFIGURATION
// =====================================================

const TABLE_TYPES = {
    "Simple Table": {
        price: 499,
        min: 1,
        max: 4,
    },

    "Family Table": {
        price: 999,
        min: 4,
        max: 8,
    },

    "Birthday Celebration": {
        price: 1499,
        min: 4,
        max: 10,
    },

    "Candle Light Dinner": {
        price: 1999,
        min: 2,
        max: 2,
    },

    "Premium / Private": {
        price: 2999,
        min: 2,
        max: 8,
    },
};


// =====================================================
// CREATE RESERVATION
// CUSTOMER
// =====================================================

const createReservation = async (req, res) => {
    try {

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Please login before making a reservation.",
            });
        }

        const {
            name,
            phone,
            email,
            tableType,
            date,
            time,
            guests,
            occasion,
            message,
        } = req.body;


        // =========================
        // BASIC VALIDATION
        // =========================

        if (
            !name ||
            !phone ||
            !email ||
            !tableType ||
            !date ||
            !time ||
            !guests
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required reservation details.",
            });
        }


        // =========================
        // PHONE VALIDATION
        // =========================

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10 digit mobile number.",
            });
        }


        // =========================
        // TABLE TYPE
        // =========================

        const tableConfig = TABLE_TYPES[tableType];

        if (!tableConfig) {
            return res.status(400).json({
                success: false,
                message: "Invalid table type selected.",
            });
        }


        // =========================
        // GUEST VALIDATION
        // =========================

        const guestCount = Number(guests);

        if (
            guestCount < tableConfig.min ||
            guestCount > tableConfig.max
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `${tableType} is suitable for ` +
                    `${tableConfig.min}-${tableConfig.max} guests.`,
            });
        }


        // =========================
        // DATE VALIDATION
        // =========================

        const selectedDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(selectedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid reservation date.",
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return res.status(400).json({
                success: false,
                message: "Reservation date cannot be in the past.",
            });
        }


        // =========================
        // CREATE
        // =========================

        const reservation = await Reservation.create({

            user: req.user.id,

            customer: {
                name,
                phone,
                email,
            },

            tableType,

            tablePrice: tableConfig.price,

            capacity: {
                min: tableConfig.min,
                max: tableConfig.max,
            },

            date,
            time,
            guests: guestCount,

            occasion: occasion || "",
            message: message || "",

            status: "PENDING",

        });


        res.status(201).json({
            success: true,
            message:
                "Reservation request submitted successfully.",
            data: reservation,
        });

    } catch (error) {

        console.error(
            "Create reservation error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to create reservation.",
        });
    }
};


// =====================================================
// CUSTOMER - MY RESERVATIONS
// =====================================================

const getMyReservations = async (req, res) => {
    try {

        const reservations =
            await Reservation.find({
                user: req.user.id,
            }).sort({
                createdAt: -1,
            });


        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations,
        });

    } catch (error) {

        console.error(
            "Get reservations error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch reservations.",
        });
    }
};


// =====================================================
// ADMIN - GET ALL RESERVATIONS
// =====================================================

const getAllReservations = async (req, res) => {
    try {

        const reservations =
            await Reservation.find()
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt: -1,
                });


        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations,
        });

    } catch (error) {

        console.error(
            "Get all reservations error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch reservations.",
        });
    }
};


// =====================================================
// ADMIN - APPROVE RESERVATION
// =====================================================

const approveReservation = async (req, res) => {
    try {

        const {
            tableNumber,
            adminNote,
        } = req.body;


        if (!tableNumber) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter an available table number.",
            });
        }


        const reservation =
            await Reservation.findById(
                req.params.id
            );


        if (!reservation) {
            return res.status(404).json({
                success: false,
                message:
                    "Reservation not found.",
            });
        }


        if (reservation.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending reservations can be approved.",
            });
        }


        // =================================================
        // CHECK TABLE COLLISION
        // =================================================

        const alreadyBooked =
            await Reservation.findOne({
                _id: {
                    $ne: reservation._id,
                },

                date: reservation.date,

                time: reservation.time,

                assignedTable: tableNumber,

                status: "CONFIRMED",
            });


        if (alreadyBooked) {
            return res.status(409).json({
                success: false,
                message:
                    "This table is already booked for the selected date and time.",
            });
        }


        // =================================================
        // APPROVE
        // =================================================

        reservation.status = "CONFIRMED";

        reservation.assignedTable =
            String(tableNumber).trim();

        reservation.adminNote =
            adminNote || "";

        reservation.approvedAt =
            new Date();


        await reservation.save();


        res.status(200).json({
            success: true,
            message:
                "Reservation confirmed successfully.",
            data: reservation,
        });

    } catch (error) {

        console.error(
            "Approve reservation error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to confirm reservation.",
        });
    }
};


// =====================================================
// ADMIN - REJECT RESERVATION
// =====================================================

const rejectReservation = async (req, res) => {
    try {

        const {
            adminNote,
        } = req.body;


        const reservation =
            await Reservation.findById(
                req.params.id
            );


        if (!reservation) {
            return res.status(404).json({
                success: false,
                message:
                    "Reservation not found.",
            });
        }


        if (reservation.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending reservations can be rejected.",
            });
        }


        reservation.status = "REJECTED";

        reservation.adminNote =
            adminNote ||
            "Unfortunately, no suitable table is available.";


        await reservation.save();


        res.status(200).json({
            success: true,
            message:
                "Reservation rejected.",
            data: reservation,
        });

    } catch (error) {

        console.error(
            "Reject reservation error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to reject reservation.",
        });
    }
};


// =====================================================
// CUSTOMER - CANCEL RESERVATION
// =====================================================

const cancelReservation = async (req, res) => {
    try {

        const reservation =
            await Reservation.findOne({
                _id: req.params.id,
                user: req.user.id,
            });


        if (!reservation) {
            return res.status(404).json({
                success: false,
                message:
                    "Reservation not found.",
            });
        }


        if (
            reservation.status === "CANCELLED"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Reservation is already cancelled.",
            });
        }


        reservation.status = "CANCELLED";

        await reservation.save();


        res.status(200).json({
            success: true,
            message:
                "Reservation cancelled successfully.",
            data: reservation,
        });

    } catch (error) {

        console.error(
            "Cancel reservation error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to cancel reservation.",
        });
    }
};


module.exports = {
    createReservation,
    getMyReservations,
    getAllReservations,
    approveReservation,
    rejectReservation,
    cancelReservation,
};