import React, { useEffect, useState } from "react";
import { getTreatmentsByDoctor } from "./api/api";
import {
    Grid,
    CircularProgress,
    Typography,
    Card,
    CardContent
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
                setError("Nu s-a gasit ID-ul doctorului.");
                setLoading(false);
                return;
            }

            try {
                const data = await getTreatmentsByDoctor(doctorId);
                setTreatments(data);
            } catch (err) {
                setError("Eroare la încarcarea tratamentelor.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTreatments();
    }, [doctorId]);

    if (loading) {
        return (
            <div className="loading-container">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <Typography color="error">{error}</Typography>
            </div>
        );
    }

    return (
        <div className="treatments-container">

            <Typography variant="h6" component="h2" className="treatments-header" gutterBottom>
                Istoric Tratamente Prescrise
            </Typography>

            {treatments.length === 0 ? (
                <div className="no-treatments">
                    <Typography variant="h6" color="textSecondary">
                        Nu ati prescris niciun tratament momentan.
                    </Typography>
                </div>
            ) : (
                <Grid container spacing={3}>
                    {treatments.map((treatment) => (
                        <Grid item xs={12} sm={6} md={4} key={treatment.id}>
                            <div className="treatment-card">
                                <div style={{ padding: '20px' }}>

                                    <Typography variant="h6" className="treatment-title" gutterBottom>
                                        {treatment.medicationName}
                                    </Typography>

                                    <Typography variant="body2" className="treatment-detail">
                                        <strong>Dozaj:</strong> {treatment.dosage}
                                    </Typography>

                                    <Typography variant="body2" className="treatment-detail">
                                        <strong>Frecvență:</strong> {treatment.frequency} pe zi
                                    </Typography>

                                    <Typography variant="body2" className="treatment-detail">
                                        <strong>Durată:</strong> {treatment.duration} zile
                                    </Typography>


                                    <Typography variant="body2" className="treatment-notes" sx={{ fontStyle: 'italic', mt: 1 }}>
                                        <strong>Note:</strong> {treatment.notes || "Nicio notă"}
                                    </Typography>


                                    <Typography variant="caption" display="block" className="treatment-meta" sx={{ mt: 2, color: 'text.secondary' }}>
                                        Patient ID: {treatment.patientId}
                                    </Typography>
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