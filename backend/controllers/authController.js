const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =========================
// GENERATE JWT
// =========================

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};


// =========================
// REGISTER USER
// =========================

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
        } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required",
            });
        }

        // Check existing user
        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "User with this email already exists",
            });
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // IMPORTANT:
        // Every signup user will ALWAYS be "user"
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "Registration successful",

            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },

                token,
            },
        });

    } catch (error) {
        console.error(
            "Register error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Registration failed",
            error: error.message,
        });
    }
};


// =========================
// LOGIN
// =========================

const login = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required",
            });
        }

        // Find user
        const user =
            await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        // Generate token
        const token =
            generateToken(user);

        res.status(200).json({
            success: true,
            message: "Login successful",

            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },

                token,
            },
        });

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Login failed",
            error: error.message,
        });
    }
};


// =========================
// GET CURRENT USER
// =========================

const getMe = async (req, res) => {
    try {
        const user =
            await User.findById(req.user.id)
                .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                "Failed to fetch user",
            error: error.message,
        });
    }
};


module.exports = {
    register,
    login,
    getMe,
};