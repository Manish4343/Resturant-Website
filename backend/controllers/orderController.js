const mongoose = require("mongoose");

const Order = require("../models/Order");
const Menu = require("../models/Menu");


// =====================================================
// PRICING CONSTANTS
// =====================================================

const GST_RATE = 18;

const PACKAGING_PER_ITEM = 10;

const HANDLING_CHARGE = 5;


// =====================================================
// ROUND MONEY
// =====================================================

const roundMoney = (amount) => {
    return Math.round(
        (Number(amount) + Number.EPSILON) * 100
    ) / 100;
};


// =====================================================
// CREATE ORDER
// CUSTOMER
// =====================================================

const createOrder = async (req, res) => {

    try {

        const {
            customer,
            items,
            paymentMethod,
        } = req.body;


        // =================================================
        // LOGIN CHECK
        // =================================================

        if (!req.user || !req.user.id) {

            return res.status(401).json({
                success: false,
                message:
                    "Please login before placing an order",
            });

        }


        // =================================================
        // CUSTOMER VALIDATION
        // =================================================

        if (
            !customer ||
            !customer.name ||
            !customer.phone ||
            !customer.address
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Customer details are required",
            });

        }


        // =================================================
        // PHONE VALIDATION
        // =================================================

        if (
            !/^[0-9]{10}$/.test(
                String(customer.phone)
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid 10 digit mobile number",
            });

        }


        // =================================================
        // ITEMS VALIDATION
        // =================================================

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Order must contain at least one item",
            });

        }


        // =================================================
        // VALIDATE ITEM IDS
        // =================================================

        for (const item of items) {

            if (
                !item.menuItem ||
                !mongoose.Types.ObjectId.isValid(
                    item.menuItem
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid menu item found in order",
                });

            }

            if (
                !Number.isInteger(
                    Number(item.quantity)
                ) ||
                Number(item.quantity) < 1
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid item quantity",
                });

            }

        }


        // =================================================
        // FETCH REAL MENU ITEMS
        // =================================================

        const menuIds = items.map(
            (item) => item.menuItem
        );


        const menuItems = await Menu.find({
            _id: {
                $in: menuIds,
            },
        });


        // =================================================
        // CHECK ALL ITEMS EXIST
        // =================================================

        if (
            menuItems.length !==
            new Set(menuIds.map(String)).size
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "One or more menu items are invalid",
            });

        }


        // =================================================
        // MENU MAP
        // =================================================

        const menuMap = new Map();

        menuItems.forEach((menuItem) => {

            menuMap.set(
                String(menuItem._id),
                menuItem
            );

        });


        // =================================================
        // BUILD VERIFIED ORDER ITEMS
        // =================================================

        const verifiedItems = [];

        let subtotal = 0;

        let totalQuantity = 0;


        for (const item of items) {

            const menuItem =
                menuMap.get(
                    String(item.menuItem)
                );


            if (!menuItem) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Menu item not found",
                });

            }


            // =================================================
            // AVAILABILITY CHECK
            // =================================================

            if (menuItem.available === false) {

                return res.status(400).json({
                    success: false,
                    message:
                        `${menuItem.name} is currently unavailable`,
                });

            }


            const quantity =
                Number(item.quantity);


            const price =
                Number(menuItem.price);


            const itemTotal =
                price * quantity;


            subtotal += itemTotal;

            totalQuantity += quantity;


            // =================================================
            // ONLY DATABASE DATA IS SAVED
            // =================================================

            verifiedItems.push({

                menuItem:
                    menuItem._id,

                name:
                    menuItem.name,

                price:
                    price,

                quantity:
                    quantity,

                image:
                    menuItem.image,

            });

        }


        // =================================================
        // PRICE CALCULATION
        // =================================================

        subtotal =
            roundMoney(subtotal);


        // 18% GST

        const gstAmount =
            roundMoney(
                subtotal *
                (GST_RATE / 100)
            );


        // ₹10 per food item quantity

        const packagingAmount =
            roundMoney(
                totalQuantity *
                PACKAGING_PER_ITEM
            );


        // ₹5 per order

        const handlingCharge =
            HANDLING_CHARGE;


        // =================================================
        // GRAND TOTAL
        // =================================================

        const totalAmount =
            roundMoney(
                subtotal +
                gstAmount +
                packagingAmount +
                handlingCharge
            );


        // =================================================
        // CREATE ORDER
        // =================================================

        const order = await Order.create({

            user:
                req.user.id,

            customer: {

                name:
                    customer.name.trim(),

                phone:
                    customer.phone.trim(),

                address:
                    customer.address.trim(),

                instructions:
                    customer.instructions
                        ? customer.instructions.trim()
                        : "",

            },


            items:
                verifiedItems,


            // =================================================
            // PRICE BREAKDOWN
            // =================================================

            subtotal,

            gstRate:
                GST_RATE,

            gstAmount,

            packagingPerItem:
                PACKAGING_PER_ITEM,

            packagingAmount,

            handlingCharge,

            totalAmount,


            paymentMethod:
                paymentMethod === "ONLINE"
                    ? "ONLINE"
                    : "COD",

        });


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Order placed successfully",

            data:
                order,

        });

    } catch (error) {

        console.error(
            "Create order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to place order",

            error:
                error.message,

        });

    }

};


// =====================================================
// GET ALL ORDERS
// ADMIN ONLY
// =====================================================

const getOrders = async (req, res) => {

    try {

        const orders =
            await Order.find()
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({

            success: true,

            count:
                orders.length,

            data:
                orders,

        });

    } catch (error) {

        console.error(
            "Get orders error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch orders",

            error:
                error.message,

        });

    }

};


// =====================================================
// GET MY ORDERS
// CUSTOMER
// =====================================================

const getMyOrders = async (req, res) => {

    try {

        if (
            !req.user ||
            !req.user.id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Please login",

            });

        }


        const orders =
            await Order.find({

                user:
                    req.user.id,

            }).sort({

                createdAt: -1,

            });


        return res.status(200).json({

            success: true,

            count:
                orders.length,

            data:
                orders,

        });

    } catch (error) {

        console.error(
            "Get my orders error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch your orders",

            error:
                error.message,

        });

    }

};


// =====================================================
// GET SINGLE MY ORDER
// CUSTOMER
// =====================================================

const getMyOrderById = async (req, res) => {

    try {

        if (
            !req.user ||
            !req.user.id
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Please login",

            });

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                req.params.id
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID",

            });

        }


        const order =
            await Order.findOne({

                _id:
                    req.params.id,

                user:
                    req.user.id,

            });


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found",

            });

        }


        return res.status(200).json({

            success: true,

            data:
                order,

        });

    } catch (error) {

        console.error(
            "Get order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch order",

            error:
                error.message,

        });

    }

};


// =====================================================
// UPDATE ORDER STATUS
// ADMIN ONLY
// =====================================================

const updateOrderStatus = async (req, res) => {

    try {

        const {
            status,
        } = req.body;


        const validStatuses = [

            "PLACED",

            "CONFIRMED",

            "PREPARING",

            "OUT_FOR_DELIVERY",

            "DELIVERED",

            "CANCELLED",

        ];


        if (
            !validStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order status",

            });

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                req.params.id
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID",

            });

        }


        const order =
            await Order.findByIdAndUpdate(

                req.params.id,

                {
                    orderStatus:
                        status,
                },

                {
                    new: true,
                    runValidators: true,
                }

            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found",

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Order status updated",

            data:
                order,

        });

    } catch (error) {

        console.error(
            "Update order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update order status",

            error:
                error.message,

        });

    }

};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    createOrder,

    getOrders,

    getMyOrders,

    getMyOrderById,

    updateOrderStatus,

};