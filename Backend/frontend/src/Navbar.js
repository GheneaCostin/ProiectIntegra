import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getNotifications } from "./api/api";
import "./Navbar.css";

function NavBar({ user, onLogout }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);


    const fetchNotifications = async () => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            try {
                const data = await getNotifications(userId);
                setNotifications(data);
            } catch (error) {
                console.error("Nu s-au putut încărca notificările.");
            }
        }
    };

    useEffect(() => {
        if (user.loggedIn) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        }
    }, [user.loggedIn]);

    const totalCount = notifications.reduce((acc, curr) => acc + curr.count, 0);

    const handleNotificationClick = (senderId, fullName) => {
        setShowDropdown(false);
        navigate(`/chat/${senderId}`, { state: { otherUserName: fullName } });

        setNotifications(prev => prev.filter(n => n.senderId !== senderId));
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">Medical App</div>
            <div className="navbar-links">
                {user.loggedIn ? (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        {user.role === 'doctor' && <Link to="/treatments">Tratamente</Link>}
                        {user.role === 'doctor' && <Link to="/export">Export</Link>}

                        <div className="notification-container">
                            <div
                                className="notification-icon"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                🔔
                                {totalCount > 0 && (
                                    <span className="notification-badge">{totalCount}</span>
                                )}
                            </div>

                            {showDropdown && (
                                <div className="notification-dropdown">
                                    <div className="dropdown-header">Notificări</div>
                                    {notifications.length === 0 ? (
                                        <div className="notification-item empty">Nu ai mesaje noi.</div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.senderId}
                                                className="notification-item"
                                                onClick={() => handleNotificationClick(notif.senderId, notif.fullName)}
                                            >
                                                <div className="notif-name">{notif.fullName}</div>
                                                <div className="notif-preview">
                                                    {notif.message.length > 20 ? notif.message.substring(0, 20) + '...' : notif.message}
                                                </div>
                                                <span className="notif-count-badge">{notif.count}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <button onClick={onLogout} className="logout-btn">Logout</button>
                    </>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
}

export default NavBar;