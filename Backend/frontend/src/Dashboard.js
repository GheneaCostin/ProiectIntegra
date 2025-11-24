import React, { useEffect, useState } from "react";
import { getPatients } from "./api/api";
import { useNavigate } from "react-router-dom";


const PatientDetails = ({ patient }) => {
    const navigate = useNavigate();


    const handlePrescribeClick = () => {

        const patientId = patient.userId || patient.id;
        navigate(`/prescribe/${patientId}`);
    };

    const detailLabelStyle = { color: '#666', fontSize: '0.9em', marginBottom: '5px' };
    const detailValueStyle = { fontSize: '1.1em', fontWeight: 'bold', color: '#333' };

    return (
        <div>

            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#007bff' }}>{patient.firstName} {patient.lastName}</h2>
                <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.9em' }}>
                    ID: {patient.userId || 'N/A'}
                </p>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                    <p style={detailLabelStyle}>Vârstă</p>
                    <p style={detailValueStyle}>{patient.age > 0 ? `${patient.age} ani` : '-'}</p>
                </div>
                <div>
                    <p style={detailLabelStyle}>Sex</p>
                    <p style={detailValueStyle}>{patient.sex !== '-' ? patient.sex : '-'}</p>
                </div>
                <div>
                    <p style={detailLabelStyle}>Greutate</p>
                    <p style={detailValueStyle}>{patient.weight > 0 ? `${patient.weight} kg` : '-'}</p>
                </div>
                <div>
                    <p style={detailLabelStyle}>Înălțime</p>
                    <p style={detailValueStyle}>{patient.height > 0 ? `${patient.height} cm` : '-'}</p>
                </div>
            </div>


            <div style={{ marginTop: '25px' }}>
                <p style={{ ...detailLabelStyle, marginBottom: '10px' }}>Informații Suplimentare</p>
                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    color: '#555',
                    fontSize: '0.95em',
                    lineHeight: '1.5'
                }}>
                    {patient.extrainfo || 'Nu există mențiuni speciale.'}
                </div>
            </div>


            <button
                onClick={handlePrescribeClick} // Apelăm funcția la click
                style={{
                    marginTop: '30px',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1em',
                    transition: 'background-color 0.2s'
                }}>
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

                const processedData = data.map((p, index) => ({
                    ...p,
                    uniqueKey: p.userId || index
                }));

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
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
    });

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Se încarcă lista de pacienți...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Eroare: {error}</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #f0f0f0' }}>
                <div>
                    <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '2em' }}>Dashboard Medical</h1>
                    <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Bine ai venit, <span style={{color: '#007bff', fontWeight: 'bold'}}>{doctorEmail}</span></p>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <span style={{ backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold' }}>
                        DOCTOR
                    </span>
                </div>
            </div>


            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={statCardStyle}>
                    <h3 style={statTitleStyle}>Total Pacienți</h3>
                    <p style={statValueStyle}>{patients.length}</p>
                </div>
                <div style={statCardStyle}>
                    <h3 style={statTitleStyle}>Tratamente Active</h3>
                    <p style={statValueStyle}>0</p>
                </div>
                <div style={statCardStyle}>
                    <h3 style={statTitleStyle}>Progres Mediu</h3>
                    <p style={statValueStyle}>0%</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', minHeight: '500px' }}>
                {/* LISTA DE PACIENȚI (STÂNGA) */}
                <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#fafafa' }}>
                        <input
                            type="text"
                            placeholder="Caută pacient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '1em' }}
                        />
                    </div>

                    {filteredPatients.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#999' }}>Nu s-au găsit pacienți.</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '600px', overflowY: 'auto' }}>
                            {filteredPatients.map((p) => (
                                <li
                                    key={p.uniqueKey}
                                    onClick={() => setSelectedPatient(p)}
                                    style={{
                                        padding: '15px 20px',
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                        backgroundColor: selectedPatient?.uniqueKey === p.uniqueKey ? '#e6f7ff' : 'transparent',
                                        borderLeft: selectedPatient?.uniqueKey === p.uniqueKey ? '4px solid #007bff' : '4px solid transparent'
                                    }}
                                >
                                    <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                                        {p.firstName} {p.lastName}
                                    </div>
                                    <div style={{ fontSize: '0.85em', color: '#888' }}>
                                        {p.sex !== '-' ? p.sex : 'Gen: -'}, {p.age > 0 ? `${p.age} ani` : 'Vârstă: -'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>


                <div style={{ flex: 2, backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    {selectedPatient ? (
                        <PatientDetails patient={selectedPatient} />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', minHeight: '300px' }}>
                            <div style={{ fontSize: '3em', marginBottom: '10px' }}>📋</div>
                            <p>Selectează un pacient din listă pentru a vedea dosarul medical.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Stiluri simple pentru carduri
const statCardStyle = {
    flex: 1,
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    textAlign: 'center',
    border: '1px solid #f0f0f0'
};

const statTitleStyle = { margin: '0 0 10px 0', color: '#888', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '1px' };
const statValueStyle = { margin: 0, fontSize: '2.5em', fontWeight: '700', color: '#007bff' };

export default Dashboard;