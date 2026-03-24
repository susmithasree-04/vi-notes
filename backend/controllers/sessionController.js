const Session = require("../models/Session");

// ============================================================
// saveSession — POST /api/sessions
// Saves a new writing session to the database
// ============================================================
const saveSession = async (req, res) => {
    try {
        const { userId, content, startTime, endTime, keystrokeTimings, pasteEvents } = req.body;

        // Basic validation — make sure required fields are present
        if (!userId || !startTime) {
            return res.status(400).json({
                error: "Missing required fields: userId and startTime are required",
            });
        }

        // Create a new session document from the request data
        const newSession = new Session({
            userId,
            content: content || "",
            startTime,
            endTime: endTime || new Date(), // default to now if not provided
            keystrokeTimings: keystrokeTimings || [],
            pasteEvents: pasteEvents || [],
        });

        // Save it to MongoDB
        const savedSession = await newSession.save();

        // Send back the saved session with a success message
        return res.status(201).json({
            message: "Session saved successfully",
            session: savedSession,
        });
    } catch (err) {
        console.error("Error saving session:", err.message);
        return res.status(500).json({ error: "Failed to save session" });
    }
};

// ============================================================
// getSessionsByUser — GET /api/sessions/:userId
// Returns all writing sessions for a specific user
// ============================================================
const getSessionsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all sessions for this user, newest first
        const sessions = await Session.find({ userId }).sort({ createdAt: -1 });

        // If no sessions found, return an empty array (not an error)
        return res.status(200).json({
            count: sessions.length,
            sessions,
        });
    } catch (err) {
        console.error("Error fetching sessions:", err.message);
        return res.status(500).json({ error: "Failed to fetch sessions" });
    }
};

// ============================================================
// getSessionById — GET /api/session/:id
// Returns a single session by its MongoDB _id
// ============================================================
const getSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findById(id);

        // If session doesn't exist, tell the client
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        return res.status(200).json({ session });
    } catch (err) {
        // Handle invalid ObjectId format (e.g. "abc123" is not a valid Mongo ID)
        if (err.kind === "ObjectId") {
            return res.status(400).json({ error: "Invalid session ID format" });
        }
        console.error("Error fetching session:", err.message);
        return res.status(500).json({ error: "Failed to fetch session" });
    }
};

module.exports = {
    saveSession,
    getSessionsByUser,
    getSessionById,
};
