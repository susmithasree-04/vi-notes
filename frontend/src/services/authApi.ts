const API_BASE = "https://editor-backend-4mmd.onrender.com/api";

export interface AuthResponse {
    message: string;
    user: { id: string; name: string; email: string };
    token: string;
}

export async function registerUser(
    name: string,
    email: string,
    password: string
): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
    }
    return response.json();
}

export async function loginUser(
    email: string,
    password: string
): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
    }
    return response.json();
}
