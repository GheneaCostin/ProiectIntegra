package com.example.Backend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "treatments")
public class Treatment {

    @Id
    private String id;
    private String medicationName;
    private String dosage;
    private int frequency;
    private String patientId;
    private String doctorId;
    private String notes;
    private Date startDate;
    private Date endDate;
    public Treatment() {}
    private List<TreatmentIntake> treatmentIntakes = new ArrayList<>();

    public Treatment(String medicationName, String dosage, int frequency) {
        this.medicationName = medicationName;
        this.dosage = dosage;
        this.frequency = frequency;
    }

    public String getId() { return id; }

    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }
    public String getDoctorId() { return doctorId; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName;}

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public int getFrequency() { return frequency; }
    public void setFrequency(int frequency) { this.frequency = frequency; }

    public List<TreatmentIntake> getTreatmentIntakes() {
        if (treatmentIntakes == null) {
            treatmentIntakes = new ArrayList<>();
        }
        return treatmentIntakes;
    }

    public void setTreatmentIntakes(List<TreatmentIntake> treatmentIntakes) {
        this.treatmentIntakes = treatmentIntakes;
    }

   public void addTreatmentIntake(TreatmentIntake intake) {
        if (this.treatmentIntakes == null) {
            this.treatmentIntakes = new ArrayList<>();
        }
        this.treatmentIntakes.add(intake);
    }
}
