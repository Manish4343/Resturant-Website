require("dotenv").config();

const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const createAdmin = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error(
                "DATABASE_URL is missing in .env"
            );
        }

        await mongoose.connect(
            process.env.DATABASE_URL
        );

        console.log(
            "MongoDB Connected ✅"
        );

        const adminEmail =
            "admin@spicehouse.com";

        const adminPassword =
            "Admin@12345";

        const adminName =
            "Swaad & Spice Admin";


        // =========================
        // CHECK EXISTING ADMIN
        // =========================

        let admin =
            await User.findOne({
                email: adminEmail,
            });


        // =========================
        // UPDATE EXISTING USER
        // =========================

        if (admin) {

            admin.name =
                adminName;

            admin.password =
                await bcrypt.hash(
                    adminPassword,
                    10
                );

            // IMPORTANT
            // User model uses role
            admin.role = "admin";

            await admin.save();

            console.log(
                "Admin user updated successfully ✅"
            );

        }

        // =========================
        // CREATE NEW ADMIN
        // =========================

        else {

            const hashedPassword =
                await bcrypt.hash(
                    adminPassword,
                    10
                );

            admin =
                await User.create({

                    name: adminName,

                    email: adminEmail,

                    password:
                        hashedPassword,

                    role: "admin",

                });

            console.log(
                "Admin user created successfully ✅"
            );

        }


        // =========================
        // ADMIN DETAILS
        // =========================

        console.log(
            "Email:",
            adminEmail
        );

        console.log(
            "Password:",
            adminPassword
        );

        console.log(
            "Role:",
            admin.role
        );


        await mongoose.connection.close();

        console.log(
            "MongoDB connection closed ✅"
        );

    } catch (error) {

        console.error(
            "❌ Admin creation failed:"
        );

        console.error(
            error.message
        );

        await mongoose.connection
            .close()
            .catch(() => {});

        process.exit(1);
    }
};


createAdmin();