import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPatients } from "./api/api";

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
                console.log("Date brute de la Backend:", data);

                if (!Array.isArray(data)) {
                    throw new Error("Backend-ul nu a returnat o listă!");
                }

                const processedData = data.map(p => {

                    let displayName = "Pacient Fara Nume";
                    if (p.firstName || p.lastName) {
                        displayName = `${p.firstName || ''} ${p.lastName || ''}`;
                    } else if (p.name) {
                        displayName = p.name;
                    } else if (p.email) {
                        displayName = p.email;
                    }

                    return {
                        ...p,
                        displayName: displayName.trim(),
                        safeId: p.userId || p.id || Math.random(),


                        age: p.age,
                        sex: p.sex,
                        weight: p.weight,
                        height: p.height,
                        extrainfo: p.extrainfo || p.extraInfo
                    };
                });

                setPatients(processedData);
            } catch (err) {
                console.error("Eroare fetch:", err);
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

    if (loading) return <div style={{padding: 20}}>Se încarcă pacienții...</div>;
    if (error) return <div style={{padding: 20, color: 'red'}}>Eroare: {error}</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>

            {/* Header */}
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>Hello, {doctorEmail}!</h1>
            </div>

            {/* Statistici */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>Total Pacienți</h3>
                    <p style={cardValueStyle}>{patients.length}</p>
                </div>
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>Pacienți Afișați</h3>
                    <p style={cardValueStyle}>{filteredPatients.length}</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>

                {/* Lista (Stânga) */}
                <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <input
                        type="text"
                        placeholder="Caută pacient..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                    />

                    {filteredPatients.length === 0 ? (
                        <p style={{ color: '#666', textAlign: 'center' }}>Nu s-au găsit pacienți.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {filteredPatients.map((p, index) => (
                                <li
                                    key={p.safeId}
                                    onClick={() => setSelectedPatient(p)}
                                    style={{
                                        padding: '12px',
                                        borderBottom: '1px solid #eee',
                                        cursor: 'pointer',
                                        backgroundColor: selectedPatient?.safeId === p.safeId ? '#e6f7ff' : 'transparent',
                                        borderLeft: selectedPatient?.safeId === p.safeId ? '4px solid #007bff' : '4px solid transparent'
                                    }}
                                >
                                    <span style={{ fontWeight: 'bold', display: 'block' }}>{p.displayName}</span>
                                    <span style={{ fontSize: '0.8em', color: '#888' }}>
                                        {/* Afișare sumară în listă */}
                                        Vârstă: {p.age || '-'} | Sex: {p.sex || '-'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Detalii (Dreapta) - AICI E CHEIA PENTRU AFIȘARE */}
                <div style={{ flex: 2, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    {selectedPatient ? (
                        <div>
                            <h2 style={{ marginTop: 0, color: '#007bff' }}>{selectedPatient.displayName}</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                                {/* Folosim proprietățile mapate (age, sex, weight...) */}
                                <p><strong>Vârstă:</strong> {selectedPatient.age || 'N/A'}</p>
                                <p><strong>Sex:</strong> {selectedPatient.sex || 'N/A'}</p>
                                <p><strong>Greutate:</strong> {selectedPatient.weight ? `${selectedPatient.weight} kg` : 'N/A'}</p>
                                <p><strong>Înălțime:</strong> {selectedPatient.height ? `${selectedPatient.height} cm` : 'N/A'}</p>
                            </div>

                            <div style={{ marginTop: '15px' }}>
                                <p><strong>Info Extra:</strong></p>
                                <p style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                                    {/* Verifică ambele variante de nume */}
                                    {selectedPatient.extrainfo || selectedPatient.extraInfo || 'Niciun comentariu adițional.'}
                                </p>
                            </div>

                            <button style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Prescrie Tratament
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
                            Selectează un pacient din listă pentru a vedea detaliile.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const cardStyle = {
    flex: 1,
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textAlign: 'center'
};

const cardTitleStyle = { margin: '0 0 10px 0', color: '#666', fontSize: '0.9em', textTransform: 'uppercase' };
const cardValueStyle = { margin: 0, fontSize: '2em', fontWeight: 'bold', color: '#007bff' };

export default Dashboard;