package com.example.Backend.dto;

import java.util.Date;

public class TreatmentIntakeDTO {
    private String treatmentId;
    private String patientId;

    private Date date;
    private int doseIndex;

    public TreatmentIntakeDTO() {}

    public TreatmentIntakeDTO(String treatmentId, String patientId, Date date, int doseIndex) {
        this.treatmentId = treatmentId;
        this.patientId = patientId;
        this.date = date;
        this.doseIndex = doseIndex;
    }

    public String getTreatmentId() {
        return treatmentId;
    }

    public void setTreatmentId(String treatmentId) {
        this.treatmentId = treatmentId;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public int getDoseIndex() {
        return doseIndex;
    }

    public void setDoseIndex(int doseIndex) {
        this.doseIndex = doseIndex;
    }
}