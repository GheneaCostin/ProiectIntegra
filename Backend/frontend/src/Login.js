import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLoginSuccess }) {

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Autentificare eșuată: ${errorText || "Email sau parolă incorectă."}`);
            }

            const data = await response.json();


            localStorage.setItem("token", data.token);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("doctorEmail", data.email || email);


            if (typeof onLoginSuccess === 'function') {
                onLoginSuccess({
                    loggedIn: true,
                    role: data.role
                });
            } else {
                console.warn("Autentificare reușită, dar onLoginSuccess prop lipsește.");
            }

            alert("Autentificare reușită! Rol: " + data.role);
            navigate("/dashboard");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="LoginContainer">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Parola"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}> {loading ? "Se încarcă..." : "Login"}
                </button>
            </form>
            {error && <p style={{ color: "red", marginTop: '15px' }}>{error}</p>}
        </div>
    );
}

export default Login;