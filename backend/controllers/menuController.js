const Menu = require("../models/Menu");

// =========================
// GET ALL MENU ITEMS
// =========================

const getMenu = async (req, res) => {
    try {
        const menuItems = await Menu.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems,
        });
    } catch (error) {
        console.error("Get menu error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch menu",
            error: error.message,
        });
    }
};


// =========================
// CREATE MENU ITEM
// =========================

const createMenu = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            available,
        } = req.body;

        if (
            !name ||
            !description ||
            price === undefined ||
            !category ||
            !image
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are required",
            });
        }

        const menuItem = await Menu.create({
            name,
            description,
            price,
            category,
            image,
            available:
                available !== undefined
                    ? available
                    : true,
        });

        res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            data: menuItem,
        });
    } catch (error) {
        console.error("Create menu error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create menu item",
            error: error.message,
        });
    }
};


// =========================
// UPDATE MENU ITEM
// =========================

const updateMenu = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            available,
        } = req.body;

        const menuItem =
            await Menu.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    description,
                    price,
                    category,
                    image,
                    available,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            data: menuItem,
        });
    } catch (error) {
        console.error("Update menu error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update menu item",
            error: error.message,
        });
    }
};


// =========================
// DELETE MENU ITEM
// =========================

const deleteMenu = async (req, res) => {
    try {
        const menuItem =
            await Menu.findByIdAndDelete(
                req.params.id
            );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Menu item deleted successfully",
        });
    } catch (error) {
        console.error("Delete menu error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete menu item",
            error: error.message,
        });
    }
};


// =========================
// UPDATE AVAILABILITY
// =========================

const updateAvailability = async (req, res) => {
    try {
        const { available } = req.body;

        const menuItem =
            await Menu.findByIdAndUpdate(
                req.params.id,
                {
                    available,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Availability updated successfully",
            data: menuItem,
        });
    } catch (error) {
        console.error(
            "Availability update error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update availability",
            error: error.message,
        });
    }
};


module.exports = {
    getMenu,
    createMenu,
    updateMenu,
    deleteMenu,
    updateAvailability,
};