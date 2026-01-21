import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import Dashboard from "./Dashboard";
import NavBar from "./Navbar";
import PrescriptionForm from "./PrescriptionForm";
import TreatmentsList from "./TreatmentsList";
import Export from "./Export";
import Chat from "./Chat";

function App() {

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");
        const doctorEmail = localStorage.getItem("doctorEmail");

        console.log("App Initialization - Token Found:", !!token);

        return {
            loggedIn: !!token,
            role: role,
            email: doctorEmail,
        };
    });

    useEffect(() => {
        console.log("Current User State:", user);
        const token = localStorage.getItem("token");
        if (!token && user.loggedIn) {
            handleLogout();
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.clear();
        setUser({ loggedIn: false, role: null, email: null });
    };

    return (
        <BrowserRouter>
            <NavBar user={user} onLogout={handleLogout} />

            <div className="App">
                <Routes>
                    <Route
                        path="/"
                        element={user.loggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
                    />

                    <Route
                        path="/login"
                        element={user.loggedIn ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={setUser} />}
                    />

                    <Route
                        path="/dashboard"
                        element={user.loggedIn ? <Dashboard user={user} /> : <Navigate to="/login" />}
                    />

                    <Route
                        path="/prescribe"
                        element={user.loggedIn ? <PrescriptionForm /> : <Navigate to="/login" />}
                    />

                    <Route
                        path="/treatments"
                        element={user.loggedIn ? <TreatmentsList /> : <Navigate to="/login" />}
                    />

                    <Route
                        path="/export"
                        element={user.loggedIn ? <Export /> : <Navigate to="/login" />}
                    />

                    <Route
                        path="/chat/:otherUserId"
                        element={user.loggedIn ? <Chat /> : <Navigate to="/login" />}
                    />

                </Routes>
            </div>
        </BrowserRouter>
    );
}
export default App;