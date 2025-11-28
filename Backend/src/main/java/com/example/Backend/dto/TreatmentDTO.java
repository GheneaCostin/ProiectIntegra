package com.example.Backend.dto;

import com.example.Backend.model.Treatment;
import com.example.Backend.model.UserDetails;
import com.example.Backend.repository.UserDetailsRepository;

import java.util.Date;

public class TreatmentDTO {
    private String id;
    private String patientId;
    private String doctorId;
    private String medicationName;
    private String dosage;
    private int frequency;
    private String notes;
    private Date startDate;
    private Date endDate;
    private String patientFirstName;
    private String patientLastName;

    public TreatmentDTO(Treatment t, UserDetailsRepository userDetailsRepository) {
        this.id = t.getId();
        this.medicationName = t.getMedicationName();
        this.dosage = t.getDosage();
        this.frequency = t.getFrequency();
        this.startDate = t.getStartDate();
        this.endDate = t.getEndDate();
        this.notes = t.getNotes();
        this.doctorId = t.getDoctorId();
        if (t.getPatientId() != null) {
            UserDetails patient = userDetailsRepository.findByUserId(t.getPatientId()).orElse(null);
            if (patient != null) {
                this.patientId = t.getPatientId();
                this.patientFirstName = patient.getFirstName();
                this.patientLastName = patient.getLastName();
            }
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMedicationName() {
        return medicationName;
    }

    public void setMedicationName(String medicationName) {
        this.medicationName = medicationName;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public int getFrequency() {
        return frequency;
    }

    public void setFrequency(int frequency) {
        this.frequency = frequency;
    }


    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getPatientFirstName() {
        return patientFirstName;
    }

    public void setPatientFirstName(String patientFirstName) {
        this.patientFirstName = patientFirstName;
    }

    public String getPatientLastName() {
        return patientLastName;
    }

    public void setPatientLastName(String patientLastName) {
        this.patientLastName = patientLastName;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }
}