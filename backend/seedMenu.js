const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const mongoose = require("mongoose");
const Menu = require("./models/Menu");

// ======================================================
// DATABASE URL
// ======================================================

const DATABASE_URL =
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error(
        "❌ MongoDB connection string missing."
    );

    console.error(
        "Add MONGODB_URI or DATABASE_URL to backend/.env"
    );

    process.exit(1);
}

// ======================================================
// MENU DATA
// ======================================================

const menuItems = [

    // =========================
    // STARTERS
    // =========================

    {
        name: "Paneer Tikka",
        description:
            "Soft paneer cubes marinated with Indian spices and grilled to perfection.",
        price: 249,
        category: "Starters",
        image:
            "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Chicken Tikka",
        description:
            "Juicy chicken pieces marinated in aromatic spices and grilled.",
        price: 299,
        category: "Starters",
        image:
            "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Samosa",
        description:
            "Crispy golden pastry filled with spiced potatoes and peas.",
        price: 99,
        category: "Starters",
        image:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Hara Bhara Kebab",
        description:
            "Delicious kebabs made with spinach, peas and Indian spices.",
        price: 199,
        category: "Starters",
        image:
            "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    // =========================
    // MAIN COURSE
    // =========================

    {
        name: "Butter Chicken",
        description:
            "Creamy tomato-based curry with tender chicken and aromatic spices.",
        price: 349,
        category: "Main Course",
        image:
            "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Paneer Butter Masala",
        description:
            "Rich and creamy tomato gravy with soft paneer cubes.",
        price: 299,
        category: "Main Course",
        image:
            "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Dal Makhani",
        description:
            "Slow-cooked black lentils finished with butter and cream.",
        price: 249,
        category: "Main Course",
        image:
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    // =========================
    // RICE & BIRYANI
    // =========================

    {
        name: "Veg Biryani",
        description:
            "Fragrant basmati rice cooked with vegetables and aromatic spices.",
        price: 249,
        category: "Rice & Biryani",
        image:
            "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Chicken Biryani",
        description:
            "Aromatic basmati rice layered with tender chicken and traditional spices.",
        price: 349,
        category: "Rice & Biryani",
        image:
            "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    // =========================
    // INDIAN BREADS
    // =========================

    {
        name: "Butter Naan",
        description:
            "Soft Indian naan brushed generously with butter.",
        price: 59,
        category: "Indian Breads",
        image:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Garlic Naan",
        description:
            "Soft naan topped with fresh garlic, coriander and butter.",
        price: 79,
        category: "Indian Breads",
        image:
            "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Tandoori Roti",
        description:
            "Traditional whole wheat roti cooked in a hot tandoor.",
        price: 39,
        category: "Indian Breads",
        image:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    // =========================
    // DESSERTS
    // =========================

    {
        name: "Gulab Jamun",
        description:
            "Soft milk-solid dumplings soaked in warm sugar syrup.",
        price: 99,
        category: "Desserts",
        image:
            "https://images.unsplash.com/photo-1666190094764-6b4a4d2c5f6e?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Rasmalai",
        description:
            "Soft cottage cheese dumplings served in creamy saffron milk.",
        price: 129,
        category: "Desserts",
        image:
            "https://images.unsplash.com/photo-1601303516534-3f4e5e8b4b7d?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Chocolate Brownie",
        description:
            "Warm and rich chocolate brownie.",
        price: 149,
        category: "Desserts",
        image:
            "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    // =========================
    // BEVERAGES
    // =========================

    {
        name: "Mango Lassi",
        description:
            "Refreshing creamy yogurt drink blended with sweet mango.",
        price: 119,
        category: "Beverages",
        image:
            "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Masala Chaas",
        description:
            "Refreshing buttermilk infused with Indian herbs and spices.",
        price: 79,
        category: "Beverages",
        image:
            "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80",
        available: true,
    },

    {
        name: "Fresh Lime Soda",
        description:
            "Refreshing lime drink with a perfect balance of sweet and tangy.",
        price: 89,
        category: "Beverages",
        image:
            "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
        available: true,
    },
];

// ======================================================
// SEED DATABASE
// ======================================================

async function seedMenu() {

    try {

        console.log("🔄 Connecting to MongoDB...");

        await mongoose.connect(DATABASE_URL, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
        });

        console.log("✅ MongoDB Connected");

        // Delete existing menu
        const deleted = await Menu.deleteMany({});

        console.log(
            `🗑️ Removed ${deleted.deletedCount} old menu items`
        );

        // Insert new menu
        const inserted =
            await Menu.insertMany(menuItems);

        console.log(
            `✅ ${inserted.length} menu items inserted`
        );

        console.log(
            "🍽️ Menu database is ready!"
        );

    } catch (error) {

        console.error(
            "\n❌ Menu seeding failed\n"
        );

        console.error(
            "Error code:",
            error.code || "UNKNOWN"
        );

        console.error(
            "Error message:",
            error.message
        );

        console.error("\nPossible causes:");

        console.error(
            "1. MongoDB Atlas is unreachable"
        );

        console.error(
            "2. Your current IP is not allowed in Atlas"
        );

        console.error(
            "3. DNS/SRV resolution is failing"
        );

        console.error(
            "4. MongoDB connection string is incorrect"
        );

        console.error(
            "5. Internet/VPN/firewall is blocking MongoDB"
        );

        process.exitCode = 1;

    } finally {

        await mongoose.connection.close();

        console.log(
            "🔌 MongoDB connection closed"
        );
    }
}

// ======================================================
// RUN
// ======================================================

seedMenu();