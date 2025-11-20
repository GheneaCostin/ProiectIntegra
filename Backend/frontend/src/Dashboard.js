import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPatients } from "./api/api";
function Dashboard() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await getPatients();
                setPatients(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);
    const filteredPatients = patients.filter(p =>
        p?.email?.toLowerCase().includes(search.toLowerCase())
    );
    const handleSelect = (p) => {
        if (selectedPatient && selectedPatient.id === p.id) {
            setSelectedPatient(null); // ascunde detaliile
        } else {
            setSelectedPatient(p); // afișează detaliile
        }
    };
    if (loading) return <p>Se încarcă pacienții...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    return (
        <div>
            <h1>Dashboard Doctor</h1>
            <input
                type=
                    "text"
                placeholder=
                    "Caută pacient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <ul>
                {filteredPatients.map(p => (
                    <li
                        key={p.id}
                        onClick={() => handleSelect(p)}
                        style={{
                            backgroundColor:
                                selectedPatient && selectedPatient.id === p.id ? "#e0f7fa" : "transparent"
                            ,
                            cursor: "pointer"
                            ,
                            padding: "5px"
                        }}
                    >
                        <p style={{ textDecoration: "none"
                            , color: "inherit" }}>
                            {p.email}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default Dashboard;