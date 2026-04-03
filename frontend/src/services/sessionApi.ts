const API_BASE = "https://editor-backend-4mmd.onrender.com/api";

export interface KeystrokeEvent {
    interval: number;
    duration: number;
    timestamp: number;
}

export interface PasteEvent {
    textLength: number;
    timestamp: number;
}

export interface SessionData {
    userId: string;
    content: string;
    startTime: string;
    endTime: string;
    keystrokeTimings: KeystrokeEvent[];
    pasteEvents: PasteEvent[];
}

export interface SaveSessionResponse {
    message: string;
    session: SessionData & { _id: string; createdAt: string };
}

export async function saveSession(data: SessionData): Promise<SaveSessionResponse> {
    const response = await fetch(`${API_BASE}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save session");
    }
    return response.json();
}

export async function getSessionsByUser(userId: string) {
    const response = await fetch(`${API_BASE}/sessions/${userId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch sessions");
    }
    return response.json();
}

export async function getSessionById(sessionId: string) {
    const response = await fetch(`${API_BASE}/session/${sessionId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch session");
    }
    return response.json();
}
