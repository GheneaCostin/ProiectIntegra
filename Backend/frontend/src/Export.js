import React, { useState, useEffect } from "react";
import { getPatients, createExport } from "./api/api";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Alert,
    CircularProgress,
    TextField
} from "@mui/material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ro } from 'date-fns/locale';
import "./Export.css";

const Export = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState("");

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchPatientsList = async () => {
            try {
                const data = await getPatients();
                if (Array.isArray(data)) {
                    const processedData = data.map(p => ({
                        ...p,
                        fullName: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || "Pacient Fara Nume",
                        id: p.userId || p.id
                    }));
                    setPatients(processedData);
                }
            } catch (err) {
                console.error("Eroare la a pacientilor:", err);
                setError("Nu s-a putut încarca lista de pacienti.");
            } finally {
                setLoading(false);
            }
        };

        fetchPatientsList();
    }, []);

    const handleExport = () => {
        if (!selectedPatientId) {
            setError("Te rog selecteaza un pacient.");
            return;
        }
        if (!startDate || !endDate) {
            setError("Te rog selecteaza intervalul de date.");
            return;
        }

        setError("");
        setSuccessMessage("Se genereaza raportul...");

        createExport({
            patientId: selectedPatientId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        })
            .then((response) => {
                setSuccessMessage("Raport descărcat cu succes!");
                setTimeout(() => setSuccessMessage(""), 3000);

            })
            .catch((err) => {
                console.error("Export error:", err);
                setError("Eroare la generarea raportului.");
            });
    };

    if (loading) {
        return <div className="export-loading"><CircularProgress /></div>;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ro}>
            <div className="export-container">
                <Box className="export-card">
                    <Typography variant="h4" component="h2" gutterBottom className="export-title">
                        Export Date Pacient
                    </Typography>

                    <Typography variant="body1" color="textSecondary" paragraph align="center">
                        Selecteaza pacientul si perioada pentru a genera raportul PDF.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="select-patient-label">Selecteaza Pacientul</InputLabel>
                        <Select
                            labelId="select-patient-label"
                            id="select-patient"
                            value={selectedPatientId}
                            label="Selectează Pacientul"
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                        >
                            {patients.map((patient) => (
                                <MenuItem key={patient.id} value={patient.id}>
                                    {patient.fullName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <DatePicker
                            label="Data Început"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            format="dd/MM/yyyy"
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                        <DatePicker
                            label="Data Sfârșit"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            minDate={startDate}
                            format="dd/MM/yyyy"
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        onClick={handleExport}
                        sx={{ mt: 4, py: 1.5, fontWeight: 'bold' }}
                    >
                        EXPORT PDF
                    </Button>
                </Box>
            </div>
        </LocalizationProvider>
    );
};

export default Export;