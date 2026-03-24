const express = require("express");
const router = express.Router();

// Import controller functions
const {
    saveSession,
    getSessionsByUser,
    getSessionById,
} = require("../controllers/sessionController");

// POST /api/sessions — save a new writing session
router.post("/sessions", saveSession);

// GET /api/sessions/:userId — get all sessions for a user
router.get("/sessions/:userId", getSessionsByUser);

// GET /api/session/:id — get a single session by its ID
router.get("/session/:id", getSessionById);

module.exports = router;
