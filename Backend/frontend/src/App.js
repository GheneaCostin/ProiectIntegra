import React, { useState, useEffect } from "react"; // Importăm useEffect
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import Dashboard from "./Dashboard";
import NavBar from "./Navbar";
import PrescriptionForm from "./PrescriptionForm";
import TreatmentsList from "./TreatmentsList";

function App() {
    const [user, setUser] = useState({
        loggedIn: false,
        role: null,
        email: null,
    });


    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");
        const doctorEmail = localStorage.getItem("doctorEmail");

        if (token && role) {
            // Dacă avem token și rol salvate, considerăm utilizatorul autentificat
            setUser({
                loggedIn: true,
                role: role,
                email: doctorEmail,
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

                    <Route
                        path="/treatments"
                        element={<TreatmentsList />}
                    />

                </Routes>
            </div>
        </BrowserRouter>
    );
}
export default App;