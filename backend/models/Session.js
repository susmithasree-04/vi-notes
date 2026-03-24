const mongoose = require("mongoose");

// Schema for a single keystroke timing event
// PRIVACY: We do NOT store which key was pressed — only timing data
// This captures the rhythm of typing (intervals and hold durations)
const keystrokeSchema = new mongoose.Schema(
  {
    // Time (ms) between this keypress and the previous one
    // First keystroke has interval = 0
    interval: { type: Number, required: true },

    // How long (ms) the key was held down before release
    duration: { type: Number, default: 0 },

    // Timestamp when this key was pressed
    timestamp: { type: Number, required: true },
  },
  { _id: false }
);

// Schema for a paste event
// Tracks WHEN pasting happened and HOW MUCH was pasted
// We do NOT store the actual pasted text for privacy
const pasteEventSchema = new mongoose.Schema(
  {
    // Number of characters pasted
    textLength: { type: Number, required: true },

    // When the paste happened
    timestamp: { type: Number, required: true },
  },
  { _id: false }
);

// Main writing session schema
// Stores everything about one writing session
const sessionSchema = new mongoose.Schema(
  {
    // Which user this session belongs to
    userId: {
      type: String,
      required: [true, "userId is required"],
      trim: true,
    },

    // The actual text content written during this session
    content: {
      type: String,
      default: "",
    },

    // When the user started typing
    startTime: {
      type: Date,
      required: [true, "startTime is required"],
    },

    // When the user finished / saved the session
    endTime: {
      type: Date,
      default: null,
    },

    // Array of keystroke timing data (no key characters stored!)
    // Used to analyze typing speed, rhythm, pauses, etc.
    keystrokeTimings: {
      type: [keystrokeSchema],
      default: [],
    },

    // Array of paste events detected during the session
    // Stores only the length of pasted text, not the text itself
    pasteEvents: {
      type: [pasteEventSchema],
      default: [],
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// Export the model so we can use it in controllers
module.exports = mongoose.model("Session", sessionSchema);
