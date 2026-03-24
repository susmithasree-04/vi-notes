const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ---- User Schema ----
// Stores user credentials for login/registration
// Simple email + password auth (no roles or OAuth for now)

const userSchema = new mongoose.Schema(
    {
        // User's display name
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },

        // Email used for login — must be unique
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        // Hashed password — never stored in plain text
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// ---- Hash password before saving ----
// This runs automatically every time we save a user
userSchema.pre("save", async function (next) {
    // Only hash if password was changed (not on every save)
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// ---- Compare password helper ----
// Used during login to check if entered password matches
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
