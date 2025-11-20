import React from "react";
import { Link } from "react-router-dom";

function PatientDetails({ patient }) {
    return (
        <div>
            <h3>{patient.name}</h3>

        </div>
    );
}
export default PatientDetails;