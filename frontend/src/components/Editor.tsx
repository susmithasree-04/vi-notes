import { useState, useRef, useCallback } from "react";
import { saveSession } from "../services/sessionApi";
import type { KeystrokeEvent, PasteEvent } from "../services/sessionApi";

// ---- Editor Component ----
// Main writing area. Captures typing rhythm and paste events
// for authenticity analysis. Does NOT record which keys are pressed (privacy).

interface EditorProps {
    userId: string; // comes from auth — links session to the logged-in user
    userName: string;
}

function Editor({ userId, userName }: EditorProps) {
    // The text content in the editor
    const [content, setContent] = useState("");

    // Status message shown after saving (success or error)
    const [statusMessage, setStatusMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // Whether we're currently saving to the backend
    const [isSaving, setIsSaving] = useState(false);

    // We use refs for keystroke/paste data so they don't cause re-renders
    const keystrokesRef = useRef<KeystrokeEvent[]>([]);
    const pasteEventsRef = useRef<PasteEvent[]>([]);

    // Track the last keypress time for calculating intervals
    const lastKeyTimeRef = useRef<number>(0);

    // Track keyDown times to calculate hold duration
    const keyDownTimeRef = useRef<number>(0);

    // Track when the user started typing
    const startTimeRef = useRef<Date | null>(null);

    // Track keystroke count in state for display updates
    const [keystrokeCount, setKeystrokeCount] = useState(0);
    const [pasteCount, setPasteCount] = useState(0);

    // ---- Handle keyDown ----
    // Record the timing of when a key is pressed (NOT which key)
    const handleKeyDown = useCallback((_e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const now = Date.now();

        // Set start time on the very first keypress
        if (!startTimeRef.current) {
            startTimeRef.current = new Date();
        }

        // Calculate interval between this press and the last one
        const interval = lastKeyTimeRef.current > 0
            ? now - lastKeyTimeRef.current
            : 0; // first keystroke has 0 interval

        // Store when this key was pressed (to calculate duration on keyUp)
        keyDownTimeRef.current = now;
        lastKeyTimeRef.current = now;

        // Record timing data — no key character stored!
        keystrokesRef.current.push({
            interval,
            duration: 0, // will be updated on keyUp
            timestamp: now,
        });

        setKeystrokeCount(keystrokesRef.current.length);
    }, []);

    // ---- Handle keyUp ----
    // Calculate how long the key was held down
    const handleKeyUp = useCallback((_e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const now = Date.now();

        // Update the duration of the most recent keystroke
        const lastEntry = keystrokesRef.current[keystrokesRef.current.length - 1];
        if (lastEntry && keyDownTimeRef.current > 0) {
            lastEntry.duration = now - keyDownTimeRef.current;
        }
    }, []);

    // ---- Handle paste events ----
    // Record WHEN pasting happened and HOW MUCH text was pasted (not the text)
    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pastedText = e.clipboardData.getData("text");

        pasteEventsRef.current.push({
            textLength: pastedText.length, // only store the length, not content
            timestamp: Date.now(),
        });

        setPasteCount(pasteEventsRef.current.length);
    }, []);

    // ---- Save the session ----
    // Bundles all captured data and sends it to the backend
    const handleSave = async () => {
        // Don't save if there's nothing written
        if (!content.trim()) {
            setStatusMessage("Please write something before saving.");
            setIsError(true);
            return;
        }

        setIsSaving(true);
        setStatusMessage("");

        try {
            const sessionData = {
                userId, // real user ID from auth
                content,
                startTime: startTimeRef.current?.toISOString() || new Date().toISOString(),
                endTime: new Date().toISOString(),
                keystrokeTimings: keystrokesRef.current,
                pasteEvents: pasteEventsRef.current,
            };

            const result = await saveSession(sessionData);
            console.log("Session saved:", result);

            // Show success and reset the editor
            setStatusMessage("Session saved successfully! ✓");
            setIsError(false);
            resetEditor();
        } catch (err) {
            console.error("Save failed:", err);
            setStatusMessage("Failed to save session. Is the backend running?");
            setIsError(true);
        } finally {
            setIsSaving(false);
        }
    };

    // ---- Reset editor state for a new session ----
    const resetEditor = () => {
        setContent("");
        keystrokesRef.current = [];
        pasteEventsRef.current = [];
        startTimeRef.current = null;
        lastKeyTimeRef.current = 0;
        keyDownTimeRef.current = 0;
        setKeystrokeCount(0);
        setPasteCount(0);
    };

    return (
        <div className="editor-container">
            {/* Greeting */}
            <div className="editor-greeting">
                Hi, {userName}! Start writing below.
            </div>

            {/* Info bar showing live stats */}
            <div className="editor-stats">
                <span>⌨️ Keystrokes: {keystrokeCount}</span>
                <span>📋 Pastes: {pasteCount}</span>
                <span>📝 Characters: {content.length}</span>
            </div>

            {/* The main writing area */}
            <textarea
                className="editor-textarea"
                placeholder="Start writing here... Your typing rhythm and paste events will be tracked for authenticity analysis. Key characters are NOT recorded."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onPaste={handlePaste}
                rows={14}
            />

            {/* Save button */}
            <button
                className="save-button"
                onClick={handleSave}
                disabled={isSaving}
            >
                {isSaving ? "Saving..." : "💾 Save Session"}
            </button>

            {/* Status message (success or error) */}
            {statusMessage && (
                <div className={`status-message ${isError ? "error" : "success"}`}>
                    {statusMessage}
                </div>
            )}
        </div>
    );
}

export default Editor;
