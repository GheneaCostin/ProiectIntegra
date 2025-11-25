package com.example.Backend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private String duration;
    public Treatment() {}

    public Treatment(String medicationName, String dosage, int frequency) {
        this.medicationName = medicationName;
        this.dosage = dosage;
        this.frequency = frequency;
    }

    public String getId() { return id; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName;}

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public int getFrequency() { return frequency; }
    public void setFrequency(int frequency) { this.frequency = frequency; }


}
