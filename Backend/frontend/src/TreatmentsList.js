import React, { useEffect, useState } from "react";
import { getTreatmentsByDoctor } from "./api/api";
import {
    Grid,
    CircularProgress,
    Typography
} from "@mui/material";
import "./TreatmentsList.css";

const TreatmentsList = () => {
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const doctorId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchTreatments = async () => {
            if (!doctorId) {
                setError("Nu s-a găsit ID-ul doctorului. Vă rugăm să vă reautentificați.");
                setLoading(false);
                return;
            }

            try {
                const data = await getTreatmentsByDoctor(doctorId);

                console.log("Date Tratamente (Raw):", data);
                if (data.length > 0) {
                    console.log("Exemplu obiect:", data[0]);
                    console.log("Are patientFirstName?", data[0].patientFirstName);
                }

                setTreatments(data);
            } catch (err) {
                setError("Eroare la încărcarea tratamentelor.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTreatments();
    }, [doctorId]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('ro-RO');
    };

    if (loading) return <div className="loading-container"><CircularProgress /></div>;
    if (error) return <div className="error-container"><Typography color="error">{error}</Typography></div>;

    return (
        <div className="treatments-container">
            <Typography variant="h4" component="h2" className="treatments-header" gutterBottom>
                Istoric Tratamente Prescrise
            </Typography>

            {treatments.length === 0 ? (
                <div className="no-treatments">
                    <Typography variant="h6" color="textSecondary">
                        Nu ați prescris niciun tratament momentan.
                    </Typography>
                </div>
            ) : (

                <Grid container spacing={3}>
                    {treatments.map((treatment) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={treatment.id}>
                            <div className="treatment-card">
                                <div style={{ padding: '20px' }}>
                                    <Typography variant="h6" className="treatment-title" gutterBottom>
                                        {treatment.treatmentName || treatment.medicationName}
                                    </Typography>

                                    <Typography variant="body2" className="treatment-detail">
                                        <strong>Dozaj:</strong> {treatment.dosage}
                                    </Typography>
                                    <Typography variant="body2" className="treatment-detail">
                                        <strong>Frecvență:</strong> {treatment.frequencyPerDay || treatment.frequency} pe zi
                                    </Typography>

                                    <div style={{ marginTop: '10px', marginBottom: '10px', padding: '5px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                                        <Typography variant="body2" className="treatment-detail" style={{ marginBottom: '2px' }}>
                                            <strong>Start:</strong> {formatDate(treatment.startDate)}
                                        </Typography>
                                        <Typography variant="body2" className="treatment-detail">
                                            <strong>Final:</strong> {formatDate(treatment.endDate)}
                                        </Typography>
                                    </div>

                                    <Typography variant="body2" className="treatment-notes" sx={{ fontStyle: 'italic', mt: 1 }}>
                                        <strong>Note:</strong> {treatment.notes || "Nicio notă"}
                                    </Typography>

                                    <div className="treatment-meta" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                        <Typography variant="subtitle2" color="primary">
                                            Pacient: {treatment.patientFirstName ? `${treatment.patientFirstName} ${treatment.patientLastName}` : "Nume Indisponibil"}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            ID: {treatment.patientId}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default TreatmentsList;