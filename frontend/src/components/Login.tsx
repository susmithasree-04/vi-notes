import { useState } from "react";
import { loginUser, registerUser } from "../services/authApi";

// ---- Login / Register Component ----
// Lets users sign up or log in with email and password
// Toggles between "login" and "register" modes

interface LoginProps {
    // Called when auth succeeds — passes user data up to App
    onAuthSuccess: (user: { id: string; name: string; email: string }) => void;
}

function Login({ onAuthSuccess }: LoginProps) {
    // Toggle between login and register modes
    const [isRegister, setIsRegister] = useState(false);

    // Form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI state
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handle form submission (both login and register)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            let result;

            if (isRegister) {
                // Validate name for registration
                if (!name.trim()) {
                    setError("Please enter your name");
                    setIsLoading(false);
                    return;
                }
                result = await registerUser(name, email, password);
            } else {
                result = await loginUser(email, password);
            }

            // Save token and user info to localStorage
            localStorage.setItem("vinotes-token", result.token);
            localStorage.setItem("vinotes-user", JSON.stringify(result.user));

            // Tell App.tsx that auth succeeded
            onAuthSuccess(result.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">
                    {isRegister ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="login-subtitle">
                    {isRegister
                        ? "Sign up to start tracking your writing"
                        : "Log in to continue your sessions"}
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    {/* Name field — only shown during registration */}
                    {isRegister && (
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Error message */}
                    {error && <div className="login-error">{error}</div>}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Please wait..."
                            : isRegister
                                ? "Create Account"
                                : "Log In"}
                    </button>
                </form>

                {/* Toggle between login and register */}
                <p className="login-toggle">
                    {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        type="button"
                        className="toggle-button"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError("");
                        }}
                    >
                        {isRegister ? "Log In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
