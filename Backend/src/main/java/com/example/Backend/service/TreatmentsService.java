package com.example.Backend.service;


import com.example.Backend.model.Treatment;
import com.example.Backend.repository.TreatmentsRepository;
import com.example.Backend.repository.UserDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TreatmentsService {

    @Autowired
    private TreatmentsRepository treatmentsRepository;

    private final UserDetailsRepository userDetailsRepository;
    public TreatmentsService(TreatmentsRepository treatmentsRepository, UserDetailsRepository userDetailsRepository) {
        this.userDetailsRepository = userDetailsRepository;
        this.treatmentsRepository = treatmentsRepository;
    }   


    public List<Treatment> getAllTreatments() {
        return treatmentsRepository.findAll();
    }

    public Treatment getTreatmentById(String id) {
        return treatmentsRepository.findById(id).orElse(null);
    }

    public Treatment addTreatment(Treatment treatment) {
        return treatmentsRepository.save(treatment);
    }

    public List<Treatment> getTreatMentByUser (String patientId){
        return treatmentsRepository.findByPatientId(patientId);
    }

    public void deleteTreatment(String id) {
        treatmentsRepository.deleteById(id);
    }
    public List<Treatment> searchTreatmentsByName(String medicationName) {
        return treatmentsRepository.findBymedicationNameIgnoreCase(medicationName);
    }

}
