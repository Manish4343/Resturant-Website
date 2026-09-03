const dns = require("dns");

// =====================================================
// DNS FIX FOR MONGODB ATLAS SRV CONNECTION
// =====================================================

dns.setServers([
    "8.8.8.8",
    "1.1.1.1",
]);


// =====================================================
// PACKAGES
// =====================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();


// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");

const menuRoutes = require("./routes/menuRoutes");

const orderRoutes = require("./routes/orderRoutes");

const reservationRoutes =
    require("./routes/reservationRoutes");


// =====================================================
// APP
// =====================================================

const app = express();

const PORT = process.env.PORT || 5000;


// =====================================================
// DATABASE URL
// Supports both MONGODB_URI and DATABASE_URL
// =====================================================

const MONGO_URI =
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;


// =====================================================
// CHECK ENVIRONMENT
// =====================================================

if (!MONGO_URI) {

    console.error(
        "❌ MongoDB connection string is missing."
    );

    console.error(
        "Add MONGODB_URI or DATABASE_URL in backend/.env"
    );

    process.exit(1);

}

if (!process.env.JWT_SECRET) {

    console.warn(
        "⚠️ JWT_SECRET is missing in .env"
    );

}


// =====================================================
// CORS
// =====================================================

app.use(
    cors({
        origin: [
            "http://localhost:5173",
        ],
        credentials: true,
    })
);


// =====================================================
// BODY PARSER
// =====================================================

app.use(
    express.json({
        limit: "5mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "5mb",
    })
);


// =====================================================
// API ROUTES
// =====================================================


// -------------------------
// AUTH
// -------------------------

app.use(
    "/api/auth",
    authRoutes
);


// -------------------------
// MENU
// -------------------------

app.use(
    "/api/menu",
    menuRoutes
);


// -------------------------
// ORDERS
// -------------------------

app.use(
    "/api/orders",
    orderRoutes
);


// -------------------------
// RESERVATIONS
// IMPORTANT: NEWLY MOUNTED
// -------------------------

app.use(
    "/api/reservations",
    reservationRoutes
);


// =====================================================
// API HEALTH CHECK
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.status(200).json({
            success: true,

            message:
                "Swaad & Spice Restaurant API is running 🚀",

            database:
                mongoose.connection.readyState === 1
                    ? "Connected"
                    : "Disconnected",

        });

    }
);


// =====================================================
// API HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "API is healthy ✅",

            server: "running",

            database:
                mongoose.connection.readyState === 1
                    ? "connected"
                    : "disconnected",

        });

    }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                `Route not found: ${req.method} ${req.originalUrl}`,

        });

    }
);


// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
    .connect(
        MONGO_URI,
        {
            serverSelectionTimeoutMS: 10000,
        }
    )

    .then(() => {

        console.log(
            "MongoDB Connected ✅"
        );

        console.log(
            `Database: ${mongoose.connection.name}`
        );


        // =============================================
        // START SERVER ONLY AFTER DATABASE CONNECTS
        // =============================================

        app.listen(
            PORT,
            () => {

                console.log(
                    `Server is connected on port ${PORT} ✅`
                );

                console.log(
                    `http://localhost:${PORT}`
                );

                console.log(
                    `Reservations API: http://localhost:${PORT}/api/reservations`
                );

            }
        );

    })

    .catch(
        (error) => {

            console.error(
                "MongoDB connection failed ❌"
            );

            console.error(
                "Error:",
                error.message
            );

            process.exit(1);

        }
    );