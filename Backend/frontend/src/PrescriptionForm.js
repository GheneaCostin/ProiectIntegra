import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { prescribeTreatment } from "./api/api";

const PrescriptionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        patientId: id || "",
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverMessage, setServerMessage] = useState("");


    useEffect(() => {
        const newErrors = {};

        if (formData.medicationName && formData.medicationName.length < 3) {
            newErrors.medicationName = "Numele medicamentului trebuie sa aiba minim 3 caractere.";
        }

        if (formData.frequency && (isNaN(formData.frequency) || Number(formData.frequency) <= 0)) {
            newErrors.frequency = "Frecventa trebuie sa fie un numar pozitiv.";
        }

        setErrors(newErrors);
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Object.keys(errors).length > 0 || !formData.medicationName || !formData.patientId) {
            setServerMessage("Te rog corecteaaz erorile inainte de a trimite.");
            return;
        }

        setIsSubmitting(true);
        setServerMessage("");

        try {
            await prescribeTreatment(formData);
            alert("Tratament prescris cu succes!");
            navigate("/dashboard");
        } catch (error) {
            setServerMessage("Eroare la salvare: " + (error.response?.data || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };


    const inputStyle = (fieldName) => ({
        width: "100%",
        padding: "10px",
        margin: "5px 0",
        borderRadius: "4px",
        border: errors[fieldName] ? "2px solid red" : "1px solid #ccc",
        boxSizing: "border-box"
    });

    return (
        <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", borderRadius: "8px", backgroundColor: "white" }}>
            <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Prescrie Tratament</h2>

            {serverMessage && <p style={{ color: serverMessage.includes("Eroare") ? "red" : "green", textAlign: "center" }}>{serverMessage}</p>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                    <label>ID Pacient:</label>
                    <input
                        type="text"
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleChange}
                        disabled={!!id}
                        style={inputStyle("patientId")}
                        required
                    />
                </div>


                <div style={{ marginBottom: "15px" }}>
                    <label>Medicament:</label>
                    <input
                        type="text"
                        name="medicationName"
                        value={formData.medicationName}
                        onChange={handleChange}
                        style={inputStyle("medicationName")}
                        placeholder="Ex: Paracetamol"
                        required
                    />
                    {errors.medicationName && <span style={{ color: "red", fontSize: "0.8em" }}>{errors.medicationName}</span>}
                </div>


                <div style={{ marginBottom: "15px" }}>
                    <label>Dozaj:</label>
                    <input
                        type="text"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        style={inputStyle("dosage")}
                        placeholder="Ex: 500mg"
                        required
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Frecvență (pe zi):</label>
                    <input
                        type="number"
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleChange}
                        style={inputStyle("frequency")}
                        placeholder="Ex: 3"
                        required
                    />
                    {errors.frequency && <span style={{ color: "red", fontSize: "0.8em" }}>{errors.frequency}</span>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || Object.keys(errors).length > 0}
                    style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: isSubmitting ? "#ccc" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        fontWeight: "bold"
                    }}
                >
                    {isSubmitting ? "Se trimite..." : "Salvează Tratament"}
                </button>
            </form>
        </div>
    );
};

export default PrescriptionForm;