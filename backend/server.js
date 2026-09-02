const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();


// =========================
// ROUTES
// =========================

const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");


// =========================
// APP
// =========================

const app = express();

const PORT = 5000;


// =========================
// MIDDLEWARE
// =========================

// Allow frontend requests
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// Read JSON body
app.use(express.json());


// =========================
// ROUTES
// =========================

// Authentication
app.use("/api/auth", authRoutes);

// Menu
app.use("/api/menu", menuRoutes);

// Orders
app.use("/api/orders", orderRoutes);


// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Restaurant API is running 🚀",
    });

});


// =========================
// 404 ROUTE
// =========================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found",
    });

});


// =========================
// MONGODB CONNECTION
// =========================

mongoose
    .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
    })

    .then(() => {

        console.log("MongoDB Connected ✅");


        // =========================
        // START SERVER
        // =========================

        app.listen(PORT, () => {

            console.log(
                `Server is connected on port ${PORT} ✅`
            );

            console.log(
                `http://localhost:${PORT}`
            );

        });

    })

    .catch((error) => {

        console.error(
            "MongoDB connection failed ❌"
        );

        console.error(
            "Error:",
            error.message
        );

    });