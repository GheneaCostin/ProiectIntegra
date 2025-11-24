import React from 'react';

const StatCard = ({ title, value }) => {
    return (
        <div style={{
            flex: 1,
            backgroundColor: '#ffffff',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
            textAlign: 'center',
            minWidth: '200px',
            border: '1px solid #e0e0e0'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '1.1em' }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>{value}</p>
        </div>
    );
};

export default StatCard;