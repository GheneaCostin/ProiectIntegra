import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { prescribeTreatment, getPatients } from "./api/api";

// Importuri Material UI
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress
} from "@mui/material";

const PrescriptionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();


    const currentDoctorId = localStorage.getItem("userId") || "";


    const [formData, setFormData] = useState({
        patientId: id || "",
        doctorId: currentDoctorId,
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: ""
    });

    const [patients, setPatients] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPatients, setIsLoadingPatients] = useState(true);
    const [serverMessage, setServerMessage] = useState({ type: "", text: "" });


    useEffect(() => {
        const fetchPatientsList = async () => {
            try {
                const data = await getPatients();
                const processedPatients = Array.isArray(data) ? data.map(p => ({
                    ...p,
                    fullName: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || "Pacient Fără Nume",
                    id: p.userId || p.id
                })) : [];
                setPatients(processedPatients);
            } catch (error) {
                console.error("Nu s-au putut încărca pacienții", error);
            } finally {
                // 🎯 IMPORTANT: Oprim încărcarea doar după ce avem datele
                setIsLoadingPatients(false);
            }
        };

        fetchPatientsList();
    }, []);

    // 3. Actualizăm ID-ul dacă se schimbă URL-ul
    useEffect(() => {
        if (id) {
            setFormData(prev => ({ ...prev, patientId: id }));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.patientId) {
            setErrors({ patientId: "Trebuie selectat un pacient." });
            return;
        }

        setIsSubmitting(true);
        setServerMessage({ type: "", text: "" });

        // Convertim frecvența la număr pentru backend
        const payload = {
            ...formData,
            frequency: parseInt(formData.frequency) || 0
        };

        try {
            await prescribeTreatment(payload);
            alert("Tratament prescris cu succes!");
            navigate("/dashboard");
        } catch (error) {
            let errorMessage = "Eroare necunoscută.";
            if (error.response && error.response.data) {
                errorMessage = typeof error.response.data === 'string'
                    ? error.response.data
                    : JSON.stringify(error.response.data);
            }
            setServerMessage({
                type: "error",
                text: "Eroare la salvare: " + errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingPatients) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 500, margin: "50px auto", padding: 3, boxShadow: 3, borderRadius: 2, bgcolor: "white" }}>
            <Typography variant="h5" sx={{ textAlign: "center", mb: 3, color: "#2c3e50" }}>
                Prescrie Tratament
            </Typography>

            {serverMessage.text && (
                <Alert severity={serverMessage.type} sx={{ mb: 2 }}>
                    {serverMessage.text}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                {/* Selector Pacient */}
                <FormControl fullWidth margin="normal" error={!!errors.patientId}>
                    <InputLabel id="patient-label">Select Patient</InputLabel>
                    <Select
                        labelId="patient-label"
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleChange}
                        label="Select Patient"
                        disabled={!!id}
                    >
                        {patients.map(p => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.fullName}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.patientId && <Typography variant="caption" color="error">{errors.patientId}</Typography>}
                </FormControl>

                <TextField
                    fullWidth
                    margin="normal"
                    label="Medicament"
                    name="medicationName"
                    value={formData.medicationName}
                    onChange={handleChange}
                    placeholder="Ex: Paracetamol"
                    required
                    error={!!errors.medicationName}
                    helperText={errors.medicationName}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Dozaj"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    placeholder="Ex: 500mg"
                    required
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Frecvență (pe zi)"
                    name="frequency"
                    type="number"
                    value={formData.frequency}
                    onChange={handleChange}
                    placeholder="Ex: 3"
                    required
                    error={!!errors.frequency}
                    helperText={errors.frequency}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Durata (zile)"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="Ex: 7"
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Note / Observații"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Adăugați observații suplimentare..."
                    multiline
                    rows={4}
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ mt: 3, py: 1.5, fontWeight: "bold" }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Se trimite..." : "Salvează Tratament"}
                </Button>
            </form>
        </Box>
    );
};

export default PrescriptionForm;