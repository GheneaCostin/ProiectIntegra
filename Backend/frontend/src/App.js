import React, { useState } from "react";
import "./App.css";
import Login from "D:\\Apps\\ProiectIntegra\\ProiectIntegra\\ProiectIntegra\\Backend\\frontend\\src\\Login.js";
import Dashboard from "D:\\Apps\\ProiectIntegra\\ProiectIntegra\\ProiectIntegra\\Backend\\frontend\\src\\Dashboard.js";

function App() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Autentificare eșuată: ${errorText || "Email sau parolă incorectă."}`);
            }
            alert("Autentificare reușită!");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="App">
            {
            }
            <Dashboard
            />
        </div>
    );
}

export default App;