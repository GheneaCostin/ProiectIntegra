package com.example.Backend.dto;

import com.example.Backend.model.Treatment;
import com.example.Backend.model.TreatmentIntake;
import com.example.Backend.repository.UserDetailsRepository;

import java.util.Date;
import java.util.List;
import java.util.ArrayList;

public class TreatmentDTO {
    private String id;
    private String medicationName;
    private String dosage;
    private int frequency;
    private Date startDate;
    private Date endDate;
    private String notes;
    private String doctorName;


    private List<TreatmentIntake> treatmentIntakes;

    public TreatmentDTO() {
    }

    public TreatmentDTO(Treatment treatment, UserDetailsRepository userDetailsRepository) {
        this.id = treatment.getId();
        this.medicationName = treatment.getMedicationName();
        this.dosage = treatment.getDosage();
        this.frequency = treatment.getFrequency();
        this.startDate = treatment.getStartDate();
        this.endDate = treatment.getEndDate();
        this.notes = treatment.getNotes();


        this.treatmentIntakes = treatment.getTreatmentIntakes() != null ? treatment.getTreatmentIntakes() : new ArrayList<>();

        if (userDetailsRepository != null && treatment.getDoctorId() != null) {
            userDetailsRepository.findByUserId(treatment.getDoctorId()).ifPresent(details -> {
                this.doctorName = "Dr. " + details.getLastName();
            });
        }
    }


    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public int getFrequency() { return frequency; }
    public void setFrequency(int frequency) { this.frequency = frequency; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public List<TreatmentIntake> getTreatmentIntakes() { return treatmentIntakes; }
    public void setTreatmentIntakes(List<TreatmentIntake> treatmentIntakes) { this.treatmentIntakes = treatmentIntakes; }
}