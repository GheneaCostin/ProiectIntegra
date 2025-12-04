import React, {useEffect, useState} from "react";
import {getTreatmentsByDoctor, updateTreatment, deleteTreatment} from "./api/api";
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
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Pagination,
    Stack
} from "@mui/material";

import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {ro} from 'date-fns/locale';

import "./TreatmentsList.css";

const TreatmentsList = () => {
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const [editOpen, setEditOpen] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filteredTreatments, setFilteredTreatments] = useState([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 6;

    const doctorId = localStorage.getItem("userId");


    const fetchTreatments = async () => {
        if (!doctorId) {
            setError("Nu s-a găsit ID-ul doctorului. Vă rugăm să vă reautentificați.");
            setLoading(false);
            return;
        }

        try {
            const data = await getTreatmentsByDoctor(doctorId, page - 1, pageSize);
            const treatmentsList = data.content || [];
            setTreatments(treatmentsList);
            setTotalPages(data.totalPages);
            setFilteredTreatments(treatmentsList);
        } catch (err) {
            setError("Eroare la încărcarea tratamentelor.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTreatments();
    }, [doctorId, page]);

    const applyFilters = () => {
        let result = treatments;


        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(t => {

                const treatmentName = (t.treatmentName || t.medicationName || "").toLowerCase();
                const patientName = `${t.patientFirstName || ""} ${t.patientLastName || ""}`.toLowerCase();

                return treatmentName.includes(lowerTerm) || patientName.includes(lowerTerm);
            });
        }


        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (filterStatus !== "All") {
            result = result.filter(t => {

                if (!t.endDate) {
                    return filterStatus === "No End Date";
                }

                const endDate = new Date(t.endDate);
                endDate.setHours(0, 0, 0, 0);

                if (filterStatus === "Active") {
                    return endDate >= today;
                } else if (filterStatus === "Ended") {
                    return endDate < today;
                } else if (filterStatus === "No End Date") {
                    return false;
                }
                return true;
            });
        }


        setFilteredTreatments(result);
    };


    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterStatus, treatments]);


    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('ro-RO');
    };


    const handleEdit = (treatment) => {

        setSelectedTreatment({...treatment});
        setEditOpen(true);
    };


    const handleEditSave = async () => {
        if (!selectedTreatment) return;

        try {
            await updateTreatment(selectedTreatment.id, selectedTreatment);
            setEditOpen(false);
            alert("Tratament actualizat cu succes!");
            fetchTreatments();
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
                fetchTreatments();
            } catch (error) {
                console.error("Error deleting treatment:", error);
                alert("Eroare la ștergerea tratamentului.");
            }
        }
    };


    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setSelectedTreatment((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (name, newValue) => {
        setSelectedTreatment(prev => ({
            ...prev,
            [name]: newValue ? newValue.toISOString() : null
        }));


        if (name === 'startDate' && selectedTreatment?.endDate) {
            const endDateDate = new Date(selectedTreatment.endDate);
            if (newValue && newValue > endDateDate) {
                setSelectedTreatment(prev => ({...prev, endDate: null}));
            }
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };


    if (loading) return <div className="loading-container"><CircularProgress/></div>;
    if (error) return <div className="error-container"><Typography color="error">{error}</Typography></div>;

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ro}>
            <div className="treatments-container">
                <Typography variant="h4" component="h2" className="treatments-header" gutterBottom>
                    Istoric Tratamente Prescrise
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        label="Căutare Tratament / Pacient"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ flex: 1, minWidth: '200px' }}
                    />

                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="filter-status-label">Status Tratament</InputLabel>
                        <Select
                            labelId="filter-status-label"
                            value={filterStatus}
                            label="Status Tratament"
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <MenuItem value="All">Toate</MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Ended">Finalizate</MenuItem>
                            <MenuItem value="No End Date">Fără dată finală</MenuItem>
                        </Select>
                    </FormControl>
                </Box>


                {filteredTreatments.length === 0 ? (
                    <div className="no-treatments">
                        <Typography variant="h6" color="textSecondary">
                            Nu s-au gasit tratamente conform criteriilor.
                        </Typography>
                    </div>
                ) : (
                    <Grid container spacing={3}>
                        {filteredTreatments.map((treatment) => (
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

                {totalPages > 1 && (
                    <Stack spacing={2} alignItems="center" sx={{ marginTop: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Stack>
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
                                    handleInputChange({ target: { name: 'medicationName', value: e.target.value } });
                                    handleInputChange({ target: { name: 'treatmentName', value: e.target.value } });
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

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <DatePicker
                                    label="Data Început"
                                    value={selectedTreatment?.startDate ? new Date(selectedTreatment.startDate) : null}
                                    onChange={(newValue) => handleDateChange('startDate', newValue)}
                                    format="dd/MM/yyyy"
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                                <DatePicker
                                    label="Data Final"
                                    value={selectedTreatment?.endDate ? new Date(selectedTreatment.endDate) : null}
                                    onChange={(newValue) => handleDateChange('endDate', newValue)}
                                    minDate={selectedTreatment?.startDate ? new Date(selectedTreatment.startDate) : null}
                                    format="dd/MM/yyyy"
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Box>

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
        </LocalizationProvider>
    );
};

export default TreatmentsList;