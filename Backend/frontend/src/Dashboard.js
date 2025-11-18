import React from 'react';

function PatientDetails({ patient }) {
    return (
        <div>
            <h3>{patient.name}</h3>
            <p>Tratament: {patient.treatment || "Nedefinit"}</p>
        </div>
    );
}
function Dashboard() {
    const [patients] = React.useState([
        { id: 1, name: "Ion Popescu"
            , treatment: "Medicament A" },
        { id: 2, name: "Maria Ionescu"
            , treatment: "Medicament B" }
    ]);


    const [selectedPatient, setSelectedPatient] = React.useState(null);

    const [value, handleChange] = React.useState("");

    const handlePatientClick = (patient) => {
        if (selectedPatient?.id === patient.id) {
            setSelectedPatient(null);
        } else {
            setSelectedPatient(patient);
        }
    };

    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(value.toLowerCase())
    );

    return (
        <div>
            <h1>Dashboard Doctor</h1>

            <input
                type="text"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
            />

            <h2>Lista Pacienti:</h2>
            <ul>
                {filteredPatients.map(p => (
                    <li
                        key={p.id}
                        onClick={() => handlePatientClick(p)}
                        style={{
                            padding: '10px',
                            backgroundColor: selectedPatient?.id === p.id ? '#a0aaaa' : '#cffbaf'
                        }}
                    >
                        {p.name}
                    </li>
                ))}
            </ul>

            {selectedPatient && <PatientDetails patient={selectedPatient} />}
        </div>
    );
}
export default Dashboard;