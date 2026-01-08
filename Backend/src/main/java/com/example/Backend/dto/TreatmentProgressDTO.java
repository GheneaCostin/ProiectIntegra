package com.example.Backend.dto;

public class TreatmentProgressDTO {
    private String treatmentId;
    private String patientId;
    private int totalPlannedDoses;
    private int takenDoses;
    private double progressPercentage;

    public TreatmentProgressDTO() {
    }

    public TreatmentProgressDTO(String treatmentId, String patientId, int totalPlannedDoses, int takenDoses, double progressPercentage) {
        this.treatmentId = treatmentId;
        this.patientId = patientId;
        this.totalPlannedDoses = totalPlannedDoses;
        this.takenDoses = takenDoses;
        this.progressPercentage = progressPercentage;
    }

    // Getters and Setters
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

    public int getTotalPlannedDoses() {
        return totalPlannedDoses;
    }

    public void setTotalPlannedDoses(int totalPlannedDoses) {
        this.totalPlannedDoses = totalPlannedDoses;
    }

    public int getTakenDoses() {
        return takenDoses;
    }

    public void setTakenDoses(int takenDoses) {
        this.takenDoses = takenDoses;
    }

    public double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}