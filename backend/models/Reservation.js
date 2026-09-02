const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        customer: {
            name: {
                type: String,
                required: true,
                trim: true,
            },

            phone: {
                type: String,
                required: true,
                trim: true,
            },

            email: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
            },
        },

        tableType: {
            type: String,
            enum: [
                "Simple Table",
                "Family Table",
                "Birthday Celebration",
                "Candle Light Dinner",
                "Premium / Private",
            ],
            required: true,
        },

        tablePrice: {
            type: Number,
            required: true,
            min: 0,
        },

        capacity: {
            min: {
                type: Number,
                required: true,
            },

            max: {
                type: Number,
                required: true,
            },
        },

        date: {
            type: String,
            required: true,
        },

        time: {
            type: String,
            required: true,
        },

        guests: {
            type: Number,
            required: true,
            min: 1,
        },

        occasion: {
            type: String,
            default: "",
            trim: true,
        },

        message: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "CONFIRMED",
                "REJECTED",
                "CANCELLED",
            ],
            default: "PENDING",
        },

        assignedTable: {
            type: String,
            default: "",
            trim: true,
        },

        adminNote: {
            type: String,
            default: "",
            trim: true,
        },

        approvedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Reservation",
    reservationSchema
);