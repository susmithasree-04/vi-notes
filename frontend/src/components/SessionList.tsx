import { useState, useEffect } from "react";
import { getSessionsByUser } from "../services/sessionApi";

// ---- SessionList Component ----
// Displays all saved writing sessions for the logged-in user
// Shows key details: date, word count, keystroke count, paste count, duration

interface SessionItem {
    _id: string;
    content: string;
    startTime: string;
    endTime: string;
    keystrokeTimings: { interval: number; duration: number; timestamp: number }[];
    pasteEvents: { textLength: number; timestamp: number }[];
    createdAt: string;
}

interface SessionListProps {
    userId: string;
}

function SessionList({ userId }: SessionListProps) {
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Which session is expanded to show full content
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Fetch sessions when component mounts
    useEffect(() => {
        fetchSessions();
    }, [userId]);

    const fetchSessions = async () => {
        setIsLoading(true);
        setError("");

        try {
            const data = await getSessionsByUser(userId);
            setSessions(data.sessions || []);
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
            setError("Failed to load sessions. Is the backend running?");
        } finally {
            setIsLoading(false);
        }
    };

    // ---- Helper: format a date string nicely ----
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // ---- Helper: calculate session duration in minutes ----
    const getDuration = (start: string, end: string) => {
        const diffMs = new Date(end).getTime() - new Date(start).getTime();
        const diffMins = Math.round(diffMs / 60000);
        if (diffMins < 1) return "< 1 min";
        return `${diffMins} min`;
    };

    // ---- Helper: count words in content ----
    const getWordCount = (text: string) => {
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    // ---- Helper: truncate content for preview ----
    const getPreview = (text: string, maxLen = 120) => {
        if (text.length <= maxLen) return text;
        return text.substring(0, maxLen) + "...";
    };

    // Toggle expand/collapse for a session
    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // ---- Loading state ----
    if (isLoading) {
        return (
            <div className="sessions-container">
                <div className="sessions-loading">Loading your sessions...</div>
            </div>
        );
    }

    // ---- Error state ----
    if (error) {
        return (
            <div className="sessions-container">
                <div className="status-message error">{error}</div>
                <button className="retry-button" onClick={fetchSessions}>
                    Try Again
                </button>
            </div>
        );
    }

    // ---- Empty state ----
    if (sessions.length === 0) {
        return (
            <div className="sessions-container">
                <div className="sessions-empty">
                    <p>📝 No sessions saved yet.</p>
                    <p>Switch to the Editor tab and start writing!</p>
                </div>
            </div>
        );
    }

    // ---- Main list ----
    return (
        <div className="sessions-container">
            <div className="sessions-header">
                <h3>Your Writing Sessions</h3>
                <span className="sessions-count">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="sessions-list">
                {sessions.map((session) => (
                    <div
                        key={session._id}
                        className={`session-card ${expandedId === session._id ? "expanded" : ""}`}
                        onClick={() => toggleExpand(session._id)}
                    >
                        {/* Session metadata row */}
                        <div className="session-meta">
                            <span className="session-date">
                                📅 {formatDate(session.createdAt)}
                            </span>
                            <span className="session-duration">
                                ⏱️ {getDuration(session.startTime, session.endTime)}
                            </span>
                        </div>

                        {/* Session stats */}
                        <div className="session-stats">
                            <span>📝 {getWordCount(session.content)} words</span>
                            <span>⌨️ {session.keystrokeTimings.length} keystrokes</span>
                            <span>📋 {session.pasteEvents.length} paste{session.pasteEvents.length !== 1 ? "s" : ""}</span>
                        </div>

                        {/* Content preview or full content */}
                        <div className="session-content">
                            {expandedId === session._id
                                ? session.content
                                : getPreview(session.content)}
                        </div>

                        {/* Expand hint */}
                        <div className="session-expand-hint">
                            {expandedId === session._id ? "Click to collapse ▲" : "Click to expand ▼"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SessionList;
