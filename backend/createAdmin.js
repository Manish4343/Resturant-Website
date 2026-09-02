require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const createAdmin = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is missing in .env");
        }

        await mongoose.connect(process.env.DATABASE_URL);

        console.log("MongoDB Connected ✅");

        const adminEmail = "admin123@spicehouse.com";
        const adminPassword = "Admin@12345";
        const adminName = "Swaad & Spice Admin";

        // Check if admin already exists
        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            // Existing user ko admin bana do
            admin.name = adminName;
            admin.password = await bcrypt.hash(adminPassword, 10);
            admin.isAdmin = true;

            await admin.save();

            console.log("=================================");
            console.log("Admin user updated successfully ✅");
            console.log("Email:", adminEmail);
            console.log("Password:", adminPassword);
            console.log("isAdmin:", admin.isAdmin);
            console.log("=================================");
        } else {
            // New admin create karo
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            admin = await User.create({
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                isAdmin: true,
            });

            console.log("=================================");
            console.log("Admin user created successfully ✅");
            console.log("Email:", adminEmail);
            console.log("Password:", adminPassword);
            console.log("isAdmin:", admin.isAdmin);
            console.log("=================================");
        }

        await mongoose.connection.close();

        console.log("MongoDB connection closed ✅");
    } catch (error) {
        console.error("❌ Admin creation failed:");
        console.error(error.message);

        await mongoose.connection.close().catch(() => {});

        process.exit(1);
    }
};

createAdmin();