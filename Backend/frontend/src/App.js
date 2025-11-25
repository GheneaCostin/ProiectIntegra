import React, { useState, useEffect } from "react"; // Importăm useEffect
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import Dashboard from "./Dashboard";
import NavBar from "./Navbar";
import PrescriptionForm from "./PrescriptionForm";

function App() {
    const [user, setUser] = useState({
        loggedIn: false,
        role: null,
    });

    // 🚨 NOU: Efect pentru restaurarea sesiunii la refresh
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");

        if (token && role) {
            // Dacă avem token și rol salvate, considerăm utilizatorul autentificat
            setUser({
                loggedIn: true,
                role: role
            });
        }
    }, []); // Se execută o singură dată la montarea aplicației

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("doctorEmail");
        localStorage.removeItem("doctorName");
        localStorage.removeItem("userRole"); // Ștergem și rolul

        setUser({ loggedIn: false, role: null });
    };

    return (
        <BrowserRouter>
            <NavBar user={user} onLogout={handleLogout} />

            <div className="App">
                <Routes>
                    <Route
                        path="/login"
                        element={<Login onLoginSuccess={setUser} />}
                    />

                    <Route
                        path="/dashboard"
                        element={<Dashboard user={user} />}
                    />

                    <Route
                        path="/prescribe"
                        element={<PrescriptionForm />}
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
export default App;