const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Secret key for signing JWTs (in production, use env variable)
const JWT_SECRET = process.env.JWT_SECRET || "vinotes-secret-key-2026";

// Helper: generate a JWT token for a user
function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" } // token valid for 7 days
    );
}

// ============================================================
// register — POST /api/auth/register
// Creates a new user account
// ============================================================
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                error: "All fields are required: name, email, password",
            });
        }

        // Check if password is long enough
        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters",
            });
        }

        // Check if email is already taken
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: "An account with this email already exists",
            });
        }

        // Create and save the new user (password gets hashed automatically)
        const newUser = new User({ name, email, password });
        await newUser.save();

        // Generate a token so they're logged in right away
        const token = generateToken(newUser);

        return res.status(201).json({
            message: "Account created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
            token,
        });
    } catch (err) {
        console.error("Registration error:", err.message);
        return res.status(500).json({ error: "Failed to create account" });
    }
};

// ============================================================
// login — POST /api/auth/login
// Authenticates user with email + password
// ============================================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        // Generate token
        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ error: "Login failed" });
    }
};

module.exports = { register, login };
