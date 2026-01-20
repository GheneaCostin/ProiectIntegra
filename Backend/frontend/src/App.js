import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import Dashboard from "./Dashboard";
import NavBar from "./Navbar";
import PrescriptionForm from "./PrescriptionForm";
import TreatmentsList from "./TreatmentsList";
import Export from "./Export";
import Chat from "./Chat";

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
            setUser({
                loggedIn: true,
                role: role,
                email: doctorEmail,
            });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("doctorEmail");
        localStorage.removeItem("doctorName");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");

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

                    <Route
                        path="/export"
                        element={<Export />}
                    />
                    <Route
                        path="/chat/:otherUserId"
                        element={<Chat />}
                    />

                </Routes>
            </div>
        </BrowserRouter>
    );
}
export default App;