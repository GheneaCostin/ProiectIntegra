import React from 'react';


function PatientDetails({ patient }) {

    return (
        <div style={{
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginTop: '20px',
            border: '1px solid #e0e0e0'
        }}>
            {/* Numele Pacientului */}
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{patient.name || "Nume Pacient"}</h3>

            {/* Detaliile Pacientului (Conform Structurii MongoDB) */}
            <p style={{ margin: '5px 0' }}>**Vârstă:** {patient.age || 'N/A'}</p>
            <p style={{ margin: '5px 0' }}>**Sex:** {patient.sex || 'N/A'}</p>
            <p style={{ margin: '5px 0' }}>**Greutate:** {patient.weight || 'N/A'} kg</p>
            <p style={{ margin: '5px 0' }}>**Înălțime:** {patient.height || 'N/A'} cm</p>
            <p style={{ margin: '10px 0' }}>**Extra Info:** {patient.extrainfo || 'Niciun comentariu'}</p>

            {/* Buton de Acțiune */}
            <button style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '15px'
            }}>
                Prescribe Treatment
            </button>
        </div>
    );
}

export default PatientDetails;