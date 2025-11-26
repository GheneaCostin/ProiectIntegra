import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

export default function Navbar({ user, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate("/login");
    };

    return (
        <AppBar position="static">
            <Toolbar className="navbar-toolbar">
                <Typography variant="h6" className="navbar-title">
                    Medical App
                </Typography>

                <Box className="navbar-links">
                    {/* Link Dashboard - doar pentru doctori */}
                    {user?.loggedIn && user.role === "doctor" && (
                        <Button color="inherit" component={Link} to="/dashboard">
                            Dashboard
                        </Button>
                    )}

                    {/* Link Treatments - doar pentru pacienți */}
                    {user?.loggedIn && user.role === "patient" && (
                        <Button color="inherit" component={Link} to="/treatments">
                            Treatments
                        </Button>
                    )}

                    {user?.loggedIn && user.role === "doctor" && (
                        <Button color="inherit" component={Link} to="/treatments">
                            Treatments
                        </Button>
                    )}


                    {/* Acest buton duce la /prescribe (fără ID), activând dropdown-ul de pacienți */}
                    {user?.loggedIn && user.role === "doctor" && (
                        <Button color="inherit" component={Link} to="/prescribe">
                            Prescribe
                        </Button>
                    )}
                </Box>

                <Box className="navbar-auth">
                    {!user?.loggedIn ? (
                        <Button color="inherit" component={Link} to="/login">
                            Login
                        </Button>
                    ) : (
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}