const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const sessionRoutes = require("./routes/sessionRoutes");
const authRoutes = require("./routes/authRoutes");

// Create Express app
const app = express();

// ---- Middleware ----
// Allow requests from the React frontend (runs on port 5173)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json({ limit: "10mb" })); // increased limit for large keystroke arrays

// ---- Routes ----
// Mount all session routes under /api
app.use("/api", sessionRoutes);

// Mount auth routes under /api/auth
app.use("/api/auth", authRoutes);

// Simple health check endpoint
app.get("/", (req, res) => {
    res.json({ message: "Vi-Notes API is running" });
});

// ---- Database Connection & Server Start ----
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vinotes";

// Connect to MongoDB, then start the server
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    });
