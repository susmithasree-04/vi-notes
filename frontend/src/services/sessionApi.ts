// Base URL for the backend API
const API_BASE = "http://localhost:5000/api";

// ---- Types for our session data ----

// A single keystroke timing event
// PRIVACY: We don't store which key was pressed — only the timing
export interface KeystrokeEvent {
    interval: number;  // ms since the previous keypress
    duration: number;  // ms the key was held down
    timestamp: number; // when the key was pressed (Unix ms)
}

// A single paste event
// We store the LENGTH of pasted text, not the text itself
export interface PasteEvent {
    textLength: number; // how many characters were pasted
    timestamp: number;
}

// The full session data we send to the backend
export interface SessionData {
    userId: string;
    content: string;
    startTime: string; // ISO date string
    endTime: string;
    keystrokeTimings: KeystrokeEvent[];
    pasteEvents: PasteEvent[];
}

// Response shape from the backend when saving a session
export interface SaveSessionResponse {
    message: string;
    session: SessionData & { _id: string; createdAt: string };
}

// ============================================================
// saveSession — sends a writing session to the backend
// ============================================================
export async function saveSession(data: SessionData): Promise<SaveSessionResponse> {
    const response = await fetch(`${API_BASE}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    // If the server returned an error, throw it so the caller can catch it
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save session");
    }

    return response.json();
}

// ============================================================
// getSessionsByUser — fetches all sessions for a user
// ============================================================
export async function getSessionsByUser(userId: string) {
    const response = await fetch(`${API_BASE}/sessions/${userId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch sessions");
    }

    return response.json();
}

// ============================================================
// getSessionById — fetches a single session by ID
// ============================================================
export async function getSessionById(sessionId: string) {
    const response = await fetch(`${API_BASE}/session/${sessionId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch session");
    }

    return response.json();
}
