import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import PrescriptionForm from "./PrescriptionForm";
import NavBar from "./Navbar";
import {useState} from "react";
function App() {
    const [user, setUser] = useState({
        loggedIn: false,
        role: null, // "doctor" sau "patient"
    });
    const handleLogout = () => {
        setUser({ loggedIn: false, role: null });
    };
    return (
        <BrowserRouter>
            <NavBar user={user} onLogout={handleLogout} />
            <Routes>
                <Route path=
                           "/login" element={<Login setUser={setUser}/>} />
                <Route path=
                           "/dashboard" element={<Dashboard />} />
                <Route
                    path="/prescribe/:id" element={<PrescriptionForm />}/>
                <Route
                    path="/prescribe" element={<PrescriptionForm />}/>
            </Routes>
        </BrowserRouter>
    );
}
export default App;