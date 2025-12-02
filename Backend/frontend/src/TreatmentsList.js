import React, { useEffect, useState } from "react";
import { getTreatmentsByDoctor, updateTreatment, deleteTreatment } from "./api/api"; // Importăm funcțiile noi
import {
    Grid,
    CircularProgress,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box
} from "@mui/material";
import "./TreatmentsList.css";

const TreatmentsList = () => {
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const [editOpen, setEditOpen] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState(null);

    const doctorId = localStorage.getItem("userId");


    const fetchTreatments = async () => {
        if (!doctorId) {
            setError("Nu s-a găsit ID-ul doctorului. Vă rugăm să vă reautentificați.");
            setLoading(false);
            return;
        }

        try {
            const data = await getTreatmentsByDoctor(doctorId);
            setTreatments(data);
        } catch (err) {
            setError("Eroare la încărcarea tratamentelor.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTreatments();
    }, [doctorId]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('ro-RO');
    };


    const handleEdit = (treatment) => {

        setSelectedTreatment({ ...treatment });
        setEditOpen(true);
    };


    const handleEditSave = async () => {
        if (!selectedTreatment) return;

        try {
            await updateTreatment(selectedTreatment.id, selectedTreatment);
            setEditOpen(false);
            alert("Tratament actualizat cu succes!");
            fetchTreatments(); // Reîncarcă lista pentru a vedea modificările
        } catch (error) {
            console.error("Error updating treatment:", error);
            alert("Eroare la actualizarea tratamentului.");
        }
    };


    const handleDelete = async (id) => {
        if (window.confirm("Sigur doriți să ștergeți acest tratament?")) {
            try {
                await deleteTreatment(id);
                alert("Tratament șters cu succes!");
                fetchTreatments(); // Reîncarcă lista
            } catch (error) {
                console.error("Error deleting treatment:", error);
                alert("Eroare la ștergerea tratamentului.");
            }
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedTreatment((prev) => ({
            ...prev,
            [name]: value,
        }));
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
                        <Grid item xs={12} sm={6} md={4} key={treatment.id}>
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


                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleEdit(treatment)}
                                            fullWidth
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleDelete(treatment.id)}
                                            fullWidth
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </div>
                            </div>
                        </Grid>
                    ))}
                </Grid>
            )}


            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Treatment</DialogTitle>
                <DialogContent>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Nume Medicament"
                            name="treatmentName"

                            value={selectedTreatment?.treatmentName || selectedTreatment?.medicationName || ""}

                            onChange={(e) => {
                                handleInputChange({
                                    target: {
                                        name: 'medicationName',
                                        value: e.target.value
                                    }
                                });

                                handleInputChange({
                                    target: {
                                        name: 'treatmentName',
                                        value: e.target.value
                                    }
                                });
                            }}
                            fullWidth
                        />
                        <TextField
                            label="Dozaj"
                            name="dosage"
                            value={selectedTreatment?.dosage || ""}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Frecvență (pe zi)"
                            name="frequency"
                            type="number"
                            value={selectedTreatment?.frequency || selectedTreatment?.frequencyPerDay || ""}
                            onChange={(e) => {
                                handleInputChange({ target: { name: 'frequency', value: e.target.value }});
                                handleInputChange({ target: { name: 'frequencyPerDay', value: e.target.value }});
                            }}
                            fullWidth
                        />
                        <TextField
                            label="Note"
                            name="notes"
                            value={selectedTreatment?.notes || ""}
                            onChange={handleInputChange}
                            multiline
                            rows={3}
                            fullWidth
                        />

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TreatmentsList;