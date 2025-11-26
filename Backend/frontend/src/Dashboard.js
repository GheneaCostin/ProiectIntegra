import React, { useEffect, useState } from "react";
import { getPatients } from "./api/api";
import { useNavigate } from "react-router-dom";
import StatCard from "./StatCard";
import "./Dashboard.css";


const PatientDetails = ({ patient }) => {
    const navigate = useNavigate();


    const handlePrescribeClick = () => {
        const patientId = patient.userId || patient.id;
        navigate(`/prescribe?patientId=${patientId}`);
    };

    return (
        <div>
            {/* Header Detalii */}
            <div className="details-header">
                <h2 className="details-name">{patient.firstName} {patient.lastName}</h2>
                <p className="details-id">ID: {patient.userId || 'N/A'}</p>
            </div>

            {/* Grid cu Informații Medicale */}
            <div className="details-grid">
                <div>
                    <p className="detail-label">Vârstă</p>
                    <p className="detail-value">{patient.age > 0 ? `${patient.age} ani` : '-'}</p>
                </div>
                <div>
                    <p className="detail-label">Sex</p>
                    <p className="detail-value">{patient.sex !== '-' ? patient.sex : '-'}</p>
                </div>
                <div>
                    <p className="detail-label">Greutate</p>
                    <p className="detail-value">{patient.weight > 0 ? `${patient.weight} kg` : '-'}</p>
                </div>
                <div>
                    <p className="detail-label">Înălțime</p>
                    <p className="detail-value">{patient.height > 0 ? `${patient.height} cm` : '-'}</p>
                </div>
            </div>

            {/* Secțiunea Info Extra */}
            <div className="extra-info-section">
                <p className="detail-label">Informații Suplimentare</p>
                <div className="extra-info-box">
                    {patient.extrainfo || 'Nu există mențiuni speciale.'}
                </div>
            </div>


            <button
                onClick={handlePrescribeClick}
                className="prescribe-btn"
            >
                Prescrie Tratament
            </button>
        </div>
    );
};


function Dashboard() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const doctorEmail = localStorage.getItem("doctorEmail") || "Doctor";

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await getPatients();
                console.log("Date Finale (Frontend):", data);

                if (!Array.isArray(data)) {
                    throw new Error("Formatul datelor de la server este incorect.");
                }

                // Procesare minimă: Adăugăm doar o cheie unică pentru React și un nume complet pentru filtrare
                const processedData = data.map((p, index) => {
                    const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
                    return {
                        ...p,
                        displayName: fullName || p.email || "Pacient Fără Nume",
                        uniqueKey: p.userId || index
                    };
                });

                setPatients(processedData);
            } catch (err) {
                console.error("Eroare la fetch:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p => {
        const name = p.displayName || "";
        return name.toLowerCase().includes(search.toLowerCase());
    });

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Se încarcă lista de pacienți...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Eroare: {error}</div>;

    return (
        <div className="dashboard-container">

            {/* Header */}
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>Dashboard Medical</h1>
                    <p className="header-subtitle">Bine ai venit, <span style={{color: '#007bff', fontWeight: 'bold'}}>{doctorEmail}</span></p>
                </div>
                <div>
                    <span className="doctor-badge">DOCTOR</span>
                </div>
            </div>

            {/* Carduri Statistici */}
            <div className="stats-container">
                <StatCard title="Total Pacienți" value={patients.length} />
                <StatCard title="Tratamente Active" value="0" />
                <StatCard title="Progres Mediu" value="0%" />
            </div>

            {/* Zona Principală: Listă + Detalii */}
            <div className="dashboard-content">

                {/* LISTA DE PACIENȚI (STÂNGA) */}
                <div className="patient-list-panel">
                    <div className="search-box-container">
                        <input
                            type="text"
                            placeholder="Caută pacient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {filteredPatients.length === 0 ? (
                        <div className="no-patients">Nu s-au găsit pacienți.</div>
                    ) : (
                        <ul className="patient-list">
                            {filteredPatients.map((p) => (
                                <li
                                    key={p.uniqueKey}
                                    onClick={() => setSelectedPatient(p)}
                                    className={`patient-item ${selectedPatient?.uniqueKey === p.uniqueKey ? 'selected' : ''}`}
                                >
                                    <div className="patient-name">
                                        {p.displayName}
                                    </div>
                                    <div className="patient-meta">
                                        {p.sex !== '-' ? p.sex : 'Gen: -'}, {p.age > 0 ? `${p.age} ani` : 'Vârstă: -'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* DETALII PACIENT (DREAPTA) */}
                <div className="patient-details-panel">
                    {selectedPatient ? (
                        <PatientDetails patient={selectedPatient} />
                    ) : (
                        <div className="empty-selection">
                            <div className="empty-icon">📋</div>
                            <p>Selectează un pacient din listă pentru a vedea dosarul medical.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;