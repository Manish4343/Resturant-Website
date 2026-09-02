const mongoose = require("mongoose");


// =====================================================
// ORDER ITEM SCHEMA
// =====================================================

const orderItemSchema = new mongoose.Schema(
    {
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        image: {
            type: String,
            required: true,
        },
    },
    {
        _id: false,
    }
);


// =====================================================
// ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema(
    {

        // =================================================
        // USER
        // =================================================

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },


        // =================================================
        // CUSTOMER DETAILS
        // =================================================

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

            address: {
                type: String,
                required: true,
                trim: true,
            },

            instructions: {
                type: String,
                default: "",
                trim: true,
            },

        },


        // =================================================
        // ORDER ITEMS
        // =================================================

        items: {
            type: [orderItemSchema],

            required: true,

            validate: {
                validator: function (items) {
                    return items.length > 0;
                },

                message:
                    "Order must contain at least one item",
            },
        },


        // =================================================
        // PRICE BREAKDOWN
        // =================================================

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        gstRate: {
            type: Number,
            default: 18,
            min: 0,
        },

        gstAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        packagingPerItem: {
            type: Number,
            default: 10,
            min: 0,
        },

        packagingAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        handlingCharge: {
            type: Number,
            default: 5,
            min: 0,
        },

        // =================================================
        // FINAL TOTAL
        // =================================================

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },


        // =================================================
        // PAYMENT METHOD
        // =================================================

        paymentMethod: {
            type: String,

            enum: [
                "COD",
                "ONLINE",
            ],

            default: "COD",
        },


        // =================================================
        // PAYMENT STATUS
        // =================================================

        paymentStatus: {
            type: String,

            enum: [
                "PENDING",
                "PAID",
                "FAILED",
            ],

            default: "PENDING",
        },


        // =================================================
        // ORDER STATUS
        // =================================================

        orderStatus: {
            type: String,

            enum: [
                "PLACED",
                "CONFIRMED",
                "PREPARING",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
            ],

            default: "PLACED",
        },

    },

    {
        timestamps: true,
    }
);


// =====================================================
// MODEL
// =====================================================

const Order = mongoose.model(
    "Order",
    orderSchema
);


module.exports = Order;